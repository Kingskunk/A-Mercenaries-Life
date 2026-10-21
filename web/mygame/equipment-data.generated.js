/*
 * GENERATED FILE -- do not hand-edit. Produced by tools/gen_equipment_data.js from
 * web/mygame/scenes/equipment.txt's apply_<slot>_loadout tables. Regenerate with
 * `node tools/gen_equipment_data.js`, or just run `node compile.js`, which does it
 * automatically before bundling play_game.html.
 *
 * Shape: window.EQUIPMENT_CATALOG.<slot> is an array of { ids: [...], fields: {...} }.
 * Each field value is either { type: "literal", value } or { type: "statRef", value }
 * -- a statRef means "read this off window.stats at apply-time" (used by the
 * "starting" weapon/sidearm entries, which copy from starting_weapon_desc etc.
 * instead of a fixed string). See equipment-panel.js's applyCatalogEntry for how
 * these get resolved.
 */
window.EQUIPMENT_CATALOG = {
  "weapon": [],
  "sidearm": [],
  "armor": [
    {
      "ids": [
        "starting"
      ],
      "fields": {
        "armor": {
          "type": "statRef",
          "value": "starting_armor"
        },
        "armor_desc": {
          "type": "statRef",
          "value": "starting_armor_desc"
        },
        "armor_type": {
          "type": "statRef",
          "value": "starting_armor_type"
        },
        "armor_prose": {
          "type": "statRef",
          "value": "starting_armor"
        }
      }
    },
    {
      "ids": [
        "brigandine"
      ],
      "fields": {
        "armor": {
          "type": "literal",
          "value": "brigandine"
        },
        "armor_desc": {
          "type": "literal",
          "value": "Studded Gambeson"
        },
        "armor_type": {
          "type": "literal",
          "value": "brigandine"
        },
        "armor_prose": {
          "type": "literal",
          "value": "gambeson"
        }
      }
    },
    {
      "ids": [
        "chain_jack"
      ],
      "fields": {
        "armor": {
          "type": "literal",
          "value": "chain-jack"
        },
        "armor_desc": {
          "type": "literal",
          "value": "Iron Chain Shirt"
        },
        "armor_type": {
          "type": "literal",
          "value": "chain_jack"
        },
        "armor_prose": {
          "type": "literal",
          "value": "chain shirt"
        }
      }
    },
    {
      "ids": [
        "plate_harness"
      ],
      "fields": {
        "armor": {
          "type": "literal",
          "value": "plate-harness"
        },
        "armor_desc": {
          "type": "literal",
          "value": "Iron Plate Harness"
        },
        "armor_type": {
          "type": "literal",
          "value": "plate_harness"
        },
        "armor_prose": {
          "type": "literal",
          "value": "plate harness"
        }
      }
    },
    {
      "ids": [
        "court_coat"
      ],
      "fields": {
        "armor": {
          "type": "literal",
          "value": "court-coat"
        },
        "armor_desc": {
          "type": "literal",
          "value": "Envoy's Court Coat"
        },
        "armor_type": {
          "type": "literal",
          "value": "cloth"
        },
        "armor_prose": {
          "type": "literal",
          "value": "envoy's court coat"
        }
      }
    },
    {
      "ids": [
        "poisoners_robes"
      ],
      "fields": {
        "armor": {
          "type": "literal",
          "value": "poisoners-robes"
        },
        "armor_desc": {
          "type": "literal",
          "value": "Poisoner's Robes"
        },
        "armor_type": {
          "type": "literal",
          "value": "cloth"
        },
        "armor_prose": {
          "type": "literal",
          "value": "poisoner's robes"
        }
      }
    },
    {
      "ids": [
        "buff_coat"
      ],
      "fields": {
        "armor": {
          "type": "literal",
          "value": "buff-coat"
        },
        "armor_desc": {
          "type": "literal",
          "value": "Scaled Coat"
        },
        "armor_type": {
          "type": "literal",
          "value": "buff_coat"
        },
        "armor_prose": {
          "type": "literal",
          "value": "scaled coat"
        }
      }
    },
    {
      "ids": [
        "leather",
        "leather_cuirass"
      ],
      "fields": {
        "armor": {
          "type": "literal",
          "value": "leather"
        },
        "armor_desc": {
          "type": "literal",
          "value": "Leather Armor"
        },
        "armor_type": {
          "type": "literal",
          "value": "leather"
        },
        "armor_prose": {
          "type": "literal",
          "value": "leather armor"
        }
      }
    },
    {
      "ids": [
        "thief_leather"
      ],
      "fields": {
        "armor": {
          "type": "literal",
          "value": "leather"
        },
        "armor_desc": {
          "type": "literal",
          "value": "Leather Jerkin"
        },
        "armor_type": {
          "type": "literal",
          "value": "leather"
        },
        "armor_prose": {
          "type": "literal",
          "value": "leather jerkin"
        }
      }
    },
    {
      "ids": [
        "scout_wraps"
      ],
      "fields": {
        "armor": {
          "type": "literal",
          "value": "leather"
        },
        "armor_desc": {
          "type": "literal",
          "value": "Scout Wraps"
        },
        "armor_type": {
          "type": "literal",
          "value": "leather"
        },
        "armor_prose": {
          "type": "literal",
          "value": "scout wraps"
        }
      }
    },
    {
      "ids": [
        "cloth",
        "scholars_cassock"
      ],
      "fields": {
        "armor": {
          "type": "literal",
          "value": "cloth"
        },
        "armor_desc": {
          "type": "literal",
          "value": "Scholar's Robe"
        },
        "armor_type": {
          "type": "literal",
          "value": "cloth"
        },
        "armor_prose": {
          "type": "literal",
          "value": "scholar's robe"
        }
      }
    },
    {
      "ids": [
        "reinforced_doublet"
      ],
      "fields": {
        "armor": {
          "type": "literal",
          "value": "cloth"
        },
        "armor_desc": {
          "type": "literal",
          "value": "Canvas Jacket"
        },
        "armor_type": {
          "type": "literal",
          "value": "cloth"
        },
        "armor_prose": {
          "type": "literal",
          "value": "canvas jacket"
        }
      }
    },
    {
      "ids": [
        "tailored_vest"
      ],
      "fields": {
        "armor": {
          "type": "literal",
          "value": "cloth"
        },
        "armor_desc": {
          "type": "literal",
          "value": "Travel Coat"
        },
        "armor_type": {
          "type": "literal",
          "value": "cloth"
        },
        "armor_prose": {
          "type": "literal",
          "value": "travel coat"
        }
      }
    },
    {
      "ids": [
        "traveling_cloak"
      ],
      "fields": {
        "armor": {
          "type": "literal",
          "value": "cloth"
        },
        "armor_desc": {
          "type": "literal",
          "value": "Traveling Robes"
        },
        "armor_type": {
          "type": "literal",
          "value": "cloth"
        },
        "armor_prose": {
          "type": "literal",
          "value": "traveling robes"
        }
      }
    },
    {
      "ids": [
        "none"
      ],
      "fields": {
        "armor": {
          "type": "literal",
          "value": "none"
        },
        "armor_desc": {
          "type": "literal",
          "value": "None"
        },
        "armor_type": {
          "type": "literal",
          "value": "cloth"
        },
        "armor_prose": {
          "type": "literal",
          "value": "linen shirt"
        }
      }
    }
  ],
  "head": [
    {
      "ids": [
        "none"
      ],
      "fields": {
        "head_desc": {
          "type": "literal",
          "value": "Bare Head"
        },
        "head_prose": {
          "type": "literal",
          "value": "bare head"
        },
        "head_ac": {
          "type": "literal",
          "value": 0
        },
        "head_is_armor": {
          "type": "literal",
          "value": false
        }
      }
    },
    {
      "ids": [
        "arming_cap"
      ],
      "fields": {
        "head_desc": {
          "type": "literal",
          "value": "Linen Cap"
        },
        "head_prose": {
          "type": "literal",
          "value": "linen cap"
        },
        "head_ac": {
          "type": "literal",
          "value": 0
        },
        "head_is_armor": {
          "type": "literal",
          "value": false
        }
      }
    },
    {
      "ids": [
        "camo_hood"
      ],
      "fields": {
        "head_desc": {
          "type": "literal",
          "value": "Mottled Hood"
        },
        "head_prose": {
          "type": "literal",
          "value": "mottled hood"
        },
        "head_ac": {
          "type": "literal",
          "value": 0
        },
        "head_is_armor": {
          "type": "literal",
          "value": false
        }
      }
    },
    {
      "ids": [
        "scholar_coif"
      ],
      "fields": {
        "head_desc": {
          "type": "literal",
          "value": "Scholar's Cap"
        },
        "head_prose": {
          "type": "literal",
          "value": "linen cap"
        },
        "head_ac": {
          "type": "literal",
          "value": 0
        },
        "head_is_armor": {
          "type": "literal",
          "value": false
        }
      }
    },
    {
      "ids": [
        "torvald_iron_sallet"
      ],
      "fields": {
        "head_desc": {
          "type": "literal",
          "value": "Iron Skullcap"
        },
        "head_prose": {
          "type": "literal",
          "value": "iron skullcap"
        },
        "head_ac": {
          "type": "literal",
          "value": 1
        },
        "head_is_armor": {
          "type": "literal",
          "value": true
        }
      }
    },
    {
      "ids": [
        "torvald_hide_cap"
      ],
      "fields": {
        "head_desc": {
          "type": "literal",
          "value": "Leather Watch Cap"
        },
        "head_prose": {
          "type": "literal",
          "value": "watch cap"
        },
        "head_ac": {
          "type": "literal",
          "value": 0
        },
        "head_is_armor": {
          "type": "literal",
          "value": false
        }
      }
    },
    {
      "ids": [
        "felt_hat"
      ],
      "fields": {
        "head_desc": {
          "type": "literal",
          "value": "Felt Hat"
        },
        "head_prose": {
          "type": "literal",
          "value": "felt hat"
        },
        "head_ac": {
          "type": "literal",
          "value": 0
        },
        "head_is_armor": {
          "type": "literal",
          "value": false
        }
      }
    },
    {
      "ids": [
        "fur_cap"
      ],
      "fields": {
        "head_desc": {
          "type": "literal",
          "value": "Fur Cap"
        },
        "head_prose": {
          "type": "literal",
          "value": "fur-trimmed cap"
        },
        "head_ac": {
          "type": "literal",
          "value": 0
        },
        "head_is_armor": {
          "type": "literal",
          "value": false
        }
      }
    },
    {
      "ids": [
        "jewelry_crescent_earrings"
      ],
      "fields": {
        "head_desc": {
          "type": "literal",
          "value": "Crescent-Moon Earrings"
        },
        "head_prose": {
          "type": "literal",
          "value": "silver crescent earrings"
        },
        "head_ac": {
          "type": "literal",
          "value": 0
        },
        "head_is_armor": {
          "type": "literal",
          "value": false
        }
      }
    },
    {
      "ids": [
        "none"
      ],
      "fields": {
        "head_desc": {
          "type": "literal",
          "value": "Bare Head"
        },
        "head_prose": {
          "type": "literal",
          "value": "bare head"
        },
        "head_ac": {
          "type": "literal",
          "value": 0
        },
        "head_is_armor": {
          "type": "literal",
          "value": false
        }
      }
    }
  ],
  "cloak": [
    {
      "ids": [
        "starting_cloak"
      ],
      "fields": {
        "cloak_desc": {
          "type": "literal",
          "value": "Cloak"
        },
        "cloak_prose": {
          "type": "literal",
          "value": "cloak"
        }
      }
    },
    {
      "ids": [
        "wool_mantle"
      ],
      "fields": {
        "cloak_desc": {
          "type": "literal",
          "value": "Wool Mantle"
        },
        "cloak_prose": {
          "type": "literal",
          "value": "wool mantle"
        }
      }
    },
    {
      "ids": [
        "camo_cloak"
      ],
      "fields": {
        "cloak_desc": {
          "type": "literal",
          "value": "Mottled Cloak"
        },
        "cloak_prose": {
          "type": "literal",
          "value": "mottled cloak"
        }
      }
    },
    {
      "ids": [
        "weather_cloak"
      ],
      "fields": {
        "cloak_desc": {
          "type": "literal",
          "value": "Marcher Weather Cloak"
        },
        "cloak_prose": {
          "type": "literal",
          "value": "marcher cloak"
        }
      }
    },
    {
      "ids": [
        "talia_oiled_cloak"
      ],
      "fields": {
        "cloak_desc": {
          "type": "literal",
          "value": "Talia's Cloak"
        },
        "cloak_prose": {
          "type": "literal",
          "value": "oiled cloak"
        }
      }
    },
    {
      "ids": [
        "broadcloth_cloak"
      ],
      "fields": {
        "cloak_desc": {
          "type": "literal",
          "value": "Traveler's Cloak"
        },
        "cloak_prose": {
          "type": "literal",
          "value": "broadcloth cloak"
        }
      }
    },
    {
      "ids": [
        "storm_cape"
      ],
      "fields": {
        "cloak_desc": {
          "type": "literal",
          "value": "Storm Cape"
        },
        "cloak_prose": {
          "type": "literal",
          "value": "storm cape"
        }
      }
    },
    {
      "ids": [
        "winter_cloak"
      ],
      "fields": {
        "cloak_desc": {
          "type": "literal",
          "value": "Winter Cloak"
        },
        "cloak_prose": {
          "type": "literal",
          "value": "winter cloak"
        }
      }
    },
    {
      "ids": [
        "summer_duster"
      ],
      "fields": {
        "cloak_desc": {
          "type": "literal",
          "value": "Summer Duster"
        },
        "cloak_prose": {
          "type": "literal",
          "value": "linen duster"
        }
      }
    },
    {
      "ids": [
        "none"
      ],
      "fields": {
        "cloak_desc": {
          "type": "literal",
          "value": "None"
        },
        "cloak_prose": {
          "type": "literal",
          "value": "bare shoulders"
        }
      }
    }
  ],
  "hands": [
    {
      "ids": [
        "starting_gloves"
      ],
      "fields": {
        "hands_desc": {
          "type": "literal",
          "value": "Gloves"
        },
        "hands_prose": {
          "type": "literal",
          "value": "gloves"
        }
      }
    },
    {
      "ids": [
        "leather_wraps"
      ],
      "fields": {
        "hands_desc": {
          "type": "literal",
          "value": "Leather Wraps"
        },
        "hands_prose": {
          "type": "literal",
          "value": "leather wraps"
        }
      }
    },
    {
      "ids": [
        "archer_bracers"
      ],
      "fields": {
        "hands_desc": {
          "type": "literal",
          "value": "Archer Bracers"
        },
        "hands_prose": {
          "type": "literal",
          "value": "archer bracers"
        }
      }
    },
    {
      "ids": [
        "scribe_gloves"
      ],
      "fields": {
        "hands_desc": {
          "type": "literal",
          "value": "Scribe's Gloves"
        },
        "hands_prose": {
          "type": "literal",
          "value": "writing gloves"
        }
      }
    },
    {
      "ids": [
        "rorik_grip_wraps"
      ],
      "fields": {
        "hands_desc": {
          "type": "literal",
          "value": "Grip Wraps"
        },
        "hands_prose": {
          "type": "literal",
          "value": "grip wraps"
        }
      }
    },
    {
      "ids": [
        "lined_gloves"
      ],
      "fields": {
        "hands_desc": {
          "type": "literal",
          "value": "Lined Gloves"
        },
        "hands_prose": {
          "type": "literal",
          "value": "fleece-lined gloves"
        }
      }
    },
    {
      "ids": [
        "scholar_gloves"
      ],
      "fields": {
        "hands_desc": {
          "type": "literal",
          "value": "Lamplight Gloves"
        },
        "hands_prose": {
          "type": "literal",
          "value": "lamplight gloves"
        }
      }
    },
    {
      "ids": [
        "masters_gloves"
      ],
      "fields": {
        "hands_desc": {
          "type": "literal",
          "value": "Spellseeker Gloves"
        },
        "hands_prose": {
          "type": "literal",
          "value": "spellseeker gloves"
        }
      }
    },
    {
      "ids": [
        "none"
      ],
      "fields": {
        "hands_desc": {
          "type": "literal",
          "value": "None"
        },
        "hands_prose": {
          "type": "literal",
          "value": "bare hands"
        }
      }
    }
  ],
  "waist": [
    {
      "ids": [
        "starting_belt"
      ],
      "fields": {
        "waist_desc": {
          "type": "literal",
          "value": "Leather Belt"
        },
        "waist_prose": {
          "type": "literal",
          "value": "leather belt"
        }
      }
    },
    {
      "ids": [
        "soldiers_belt"
      ],
      "fields": {
        "waist_desc": {
          "type": "literal",
          "value": "Soldier's Belt"
        },
        "waist_prose": {
          "type": "literal",
          "value": "soldier's belt"
        }
      }
    },
    {
      "ids": [
        "scabbard_belt"
      ],
      "fields": {
        "waist_desc": {
          "type": "literal",
          "value": "Scabbard Belt"
        },
        "waist_prose": {
          "type": "literal",
          "value": "scabbard belt"
        }
      }
    },
    {
      "ids": [
        "satchel_harness"
      ],
      "fields": {
        "waist_desc": {
          "type": "literal",
          "value": "Satchel Harness"
        },
        "waist_prose": {
          "type": "literal",
          "value": "satchel harness"
        }
      }
    },
    {
      "ids": [
        "rorik_campaign_belt"
      ],
      "fields": {
        "waist_desc": {
          "type": "literal",
          "value": "Campaign Belt"
        },
        "waist_prose": {
          "type": "literal",
          "value": "campaign belt"
        }
      }
    },
    {
      "ids": [
        "none"
      ],
      "fields": {
        "waist_desc": {
          "type": "literal",
          "value": "None"
        },
        "waist_prose": {
          "type": "literal",
          "value": "unbelted waist"
        }
      }
    }
  ],
  "feet": [
    {
      "ids": [
        "starting_boots"
      ],
      "fields": {
        "feet_desc": {
          "type": "literal",
          "value": "Boots"
        },
        "feet_prose": {
          "type": "literal",
          "value": "boots"
        }
      }
    },
    {
      "ids": [
        "marching_boots"
      ],
      "fields": {
        "feet_desc": {
          "type": "literal",
          "value": "Marching Boots"
        },
        "feet_prose": {
          "type": "literal",
          "value": "marching boots"
        }
      }
    },
    {
      "ids": [
        "scout_boots"
      ],
      "fields": {
        "feet_desc": {
          "type": "literal",
          "value": "Scout Boots"
        },
        "feet_prose": {
          "type": "literal",
          "value": "scout boots"
        }
      }
    },
    {
      "ids": [
        "riding_boots"
      ],
      "fields": {
        "feet_desc": {
          "type": "literal",
          "value": "Riding Boots"
        },
        "feet_prose": {
          "type": "literal",
          "value": "riding boots"
        }
      }
    },
    {
      "ids": [
        "talia_deck_boots"
      ],
      "fields": {
        "feet_desc": {
          "type": "literal",
          "value": "Talia's Deck Boots"
        },
        "feet_prose": {
          "type": "literal",
          "value": "deck boots"
        }
      }
    },
    {
      "ids": [
        "brant_iron_heel_boots"
      ],
      "fields": {
        "feet_desc": {
          "type": "literal",
          "value": "Brant's Iron-Heel Boots"
        },
        "feet_prose": {
          "type": "literal",
          "value": "iron-heeled boots"
        }
      }
    },
    {
      "ids": [
        "waxed_boots"
      ],
      "fields": {
        "feet_desc": {
          "type": "literal",
          "value": "Rain Boots"
        },
        "feet_prose": {
          "type": "literal",
          "value": "waxed riding boots"
        }
      }
    },
    {
      "ids": [
        "winter_boots"
      ],
      "fields": {
        "feet_desc": {
          "type": "literal",
          "value": "Winter Boots"
        },
        "feet_prose": {
          "type": "literal",
          "value": "felt-lined boots"
        }
      }
    },
    {
      "ids": [
        "dancing_slippers"
      ],
      "fields": {
        "feet_desc": {
          "type": "literal",
          "value": "Swallowstep Shoes"
        },
        "feet_prose": {
          "type": "literal",
          "value": "swallowstep shoes"
        }
      }
    },
    {
      "ids": [
        "wooden_clogs"
      ],
      "fields": {
        "feet_desc": {
          "type": "literal",
          "value": "Wooden Clogs"
        },
        "feet_prose": {
          "type": "literal",
          "value": "wooden clogs"
        }
      }
    },
    {
      "ids": [
        "none"
      ],
      "fields": {
        "feet_desc": {
          "type": "literal",
          "value": "Bare Feet"
        },
        "feet_prose": {
          "type": "literal",
          "value": "bare feet"
        }
      }
    }
  ],
  "neck": [
    {
      "ids": [
        "wool_muffler"
      ],
      "fields": {
        "neck_desc": {
          "type": "literal",
          "value": "Wool Muffler"
        },
        "neck_prose": {
          "type": "literal",
          "value": "wool muffler"
        }
      }
    },
    {
      "ids": [
        "silk_neckcloth"
      ],
      "fields": {
        "neck_desc": {
          "type": "literal",
          "value": "Silvertongue Cravat"
        },
        "neck_prose": {
          "type": "literal",
          "value": "silvertongue cravat"
        }
      }
    },
    {
      "ids": [
        "jewelry_drop_pendant"
      ],
      "fields": {
        "neck_desc": {
          "type": "literal",
          "value": "Drop Pendant"
        },
        "neck_prose": {
          "type": "literal",
          "value": "silver drop pendant"
        }
      }
    },
    {
      "ids": [
        "jewelry_gold_necklace"
      ],
      "fields": {
        "neck_desc": {
          "type": "literal",
          "value": "Fine Gold Necklace"
        },
        "neck_prose": {
          "type": "literal",
          "value": "fine gold necklace"
        }
      }
    },
    {
      "ids": [
        "jewelry_emerald_pearl_necklace"
      ],
      "fields": {
        "neck_desc": {
          "type": "literal",
          "value": "Emerald Pearl Necklace"
        },
        "neck_prose": {
          "type": "literal",
          "value": "emerald pearl necklace"
        }
      }
    },
    {
      "ids": [
        "jewelry_ruby_pearl_necklace"
      ],
      "fields": {
        "neck_desc": {
          "type": "literal",
          "value": "Ruby Pearl Necklace"
        },
        "neck_prose": {
          "type": "literal",
          "value": "ruby pearl necklace"
        }
      }
    },
    {
      "ids": [
        "none"
      ],
      "fields": {
        "neck_desc": {
          "type": "literal",
          "value": "Bare Throat"
        },
        "neck_prose": {
          "type": "literal",
          "value": "bare throat"
        }
      }
    },
    {
      "ids": [
        "hearthstone_talisman"
      ],
      "fields": {
        "neck_desc": {
          "type": "literal",
          "value": "Torvald's Hearthstone Talisman"
        },
        "neck_prose": {
          "type": "literal",
          "value": "hearthstone talisman"
        }
      }
    }
  ],
  "ring": [
    {
      "ids": [
        "none"
      ],
      "fields": {
        "new_ring_desc": {
          "type": "literal",
          "value": "Bare Finger"
        },
        "new_ring_prose": {
          "type": "literal",
          "value": "bare finger"
        }
      }
    },
    {
      "ids": [
        "toll_seal_ring"
      ],
      "fields": {
        "new_ring_desc": {
          "type": "literal",
          "value": "Officer's Signet Ring"
        },
        "new_ring_prose": {
          "type": "literal",
          "value": "signet ring"
        }
      }
    },
    {
      "ids": [
        "althea_votive_ring"
      ],
      "fields": {
        "new_ring_desc": {
          "type": "literal",
          "value": "Althea's Stone Ring"
        },
        "new_ring_prose": {
          "type": "literal",
          "value": "river-stone ring"
        }
      }
    },
    {
      "ids": [
        "night_eye_ring"
      ],
      "fields": {
        "new_ring_desc": {
          "type": "literal",
          "value": "Night-Eye Ring"
        },
        "new_ring_prose": {
          "type": "literal",
          "value": "black horn ring"
        }
      }
    },
    {
      "ids": [
        "jewelry_silver_ring"
      ],
      "fields": {
        "new_ring_desc": {
          "type": "literal",
          "value": "Silver Ring"
        },
        "new_ring_prose": {
          "type": "literal",
          "value": "plain silver ring"
        }
      }
    },
    {
      "ids": [
        "jewelry_gold_ring"
      ],
      "fields": {
        "new_ring_desc": {
          "type": "literal",
          "value": "Gold Ring"
        },
        "new_ring_prose": {
          "type": "literal",
          "value": "plain gold ring"
        }
      }
    },
    {
      "ids": [
        "jewelry_sapphire_gold_ring"
      ],
      "fields": {
        "new_ring_desc": {
          "type": "literal",
          "value": "Sapphire Gold Ring"
        },
        "new_ring_prose": {
          "type": "literal",
          "value": "sapphire-set gold ring"
        }
      }
    },
    {
      "ids": [
        "jewelry_ruby_gold_ring"
      ],
      "fields": {
        "new_ring_desc": {
          "type": "literal",
          "value": "Ruby Gold Ring"
        },
        "new_ring_prose": {
          "type": "literal",
          "value": "ruby-set gold ring"
        }
      }
    },
    {
      "ids": [
        "jewelry_diamond_gold_ring"
      ],
      "fields": {
        "new_ring_desc": {
          "type": "literal",
          "value": "Diamond Gold Ring"
        },
        "new_ring_prose": {
          "type": "literal",
          "value": "diamond-set gold ring"
        }
      }
    }
  ]
};
// id -> the short text for what a worn item does (weather cuts, score bonus), from equipment.txt garment_traits.
window.GARMENT_HINTS = {
  "starting_cloak": "Weather wear: cold -40%, rain -40%",
  "wool_mantle": "Weather wear: cold -65%, rain -30%",
  "weather_cloak": "Weather wear: cold -30%, rain -65%",
  "camo_cloak": "Weather wear: cold -40%, rain -40%",
  "talia_oiled_cloak": "Weather wear: cold -50%, rain -80%",
  "talia_deck_boots": "Weather wear: rain -30%",
  "brant_iron_heel_boots": "Weather wear: rain -20%; Caulked Grip +2",
  "broadcloth_cloak": "Weather wear: cold -55%, rain -45%",
  "storm_cape": "Weather wear: cold -30%, rain -75%",
  "winter_cloak": "Weather wear: cold -90%, rain -40%, heat +40%",
  "summer_duster": "Weather wear: cold -10%, rain -30%, heat -60%",
  "felt_hat": "Weather wear: rain -15%, heat -25%",
  "fur_cap": "Weather wear: cold -20%",
  "lined_gloves": "Weather wear: cold -20%",
  "scholar_gloves": "+1 INT",
  "masters_gloves": "+2 INT",
  "waxed_boots": "Weather wear: cold -10%, rain -25%",
  "winter_boots": "Weather wear: cold -25%",
  "dancing_slippers": "+1 DEX",
  "wool_muffler": "Weather wear: cold -10%",
  "silk_neckcloth": "+1 CHA",
  "court_coat": "Weather wear: cold -25%, rain -10%; +2 CHA",
  "wooden_clogs": "Weather wear: rain -15%"
};
