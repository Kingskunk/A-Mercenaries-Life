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
  "weapon": [
    {
      "ids": [
        "starting"
      ],
      "fields": {
        "weapon": {
          "type": "statRef",
          "value": "starting_weapon"
        },
        "weapon_desc": {
          "type": "statRef",
          "value": "starting_weapon_desc"
        },
        "weapon_damage": {
          "type": "statRef",
          "value": "starting_weapon_damage"
        },
        "weapon_damage_type": {
          "type": "statRef",
          "value": "starting_weapon_damage_type"
        },
        "weapon_type": {
          "type": "statRef",
          "value": "starting_weapon_type"
        },
        "weapon_hands": {
          "type": "statRef",
          "value": "starting_weapon_hands"
        },
        "weapon_prose": {
          "type": "statRef",
          "value": "starting_weapon"
        }
      }
    },
    {
      "ids": [
        "timber_axe"
      ],
      "fields": {
        "weapon": {
          "type": "literal",
          "value": "timber axe"
        },
        "weapon_desc": {
          "type": "literal",
          "value": "Highland Hewing Axe"
        },
        "weapon_damage": {
          "type": "literal",
          "value": "1d8 slashing"
        },
        "weapon_damage_type": {
          "type": "literal",
          "value": "slashing"
        },
        "weapon_type": {
          "type": "literal",
          "value": "melee"
        },
        "weapon_hands": {
          "type": "literal",
          "value": "one_handed"
        },
        "weapon_prose": {
          "type": "literal",
          "value": "hewing axe"
        }
      }
    },
    {
      "ids": [
        "stiletto"
      ],
      "fields": {
        "weapon": {
          "type": "literal",
          "value": "stiletto"
        },
        "weapon_desc": {
          "type": "literal",
          "value": "Alderford Stiletto"
        },
        "weapon_damage": {
          "type": "literal",
          "value": "1d4 piercing"
        },
        "weapon_damage_type": {
          "type": "literal",
          "value": "piercing"
        },
        "weapon_type": {
          "type": "literal",
          "value": "finesse"
        },
        "weapon_hands": {
          "type": "literal",
          "value": "one_handed"
        },
        "weapon_prose": {
          "type": "literal",
          "value": "stiletto"
        }
      }
    },
    {
      "ids": [
        "ash_spear"
      ],
      "fields": {
        "weapon": {
          "type": "literal",
          "value": "ash-wood spear"
        },
        "weapon_desc": {
          "type": "literal",
          "value": "Seven-Foot Ash-Wood Spear"
        },
        "weapon_damage": {
          "type": "literal",
          "value": "1d6/1d8 piercing"
        },
        "weapon_damage_type": {
          "type": "literal",
          "value": "piercing"
        },
        "weapon_type": {
          "type": "literal",
          "value": "reach"
        },
        "weapon_hands": {
          "type": "literal",
          "value": "one_handed"
        },
        "weapon_prose": {
          "type": "literal",
          "value": "ash spear"
        }
      }
    },
    {
      "ids": [
        "felling_axe"
      ],
      "fields": {
        "weapon": {
          "type": "literal",
          "value": "heavy broadaxe"
        },
        "weapon_desc": {
          "type": "literal",
          "value": "Heavy Hooked Broadaxe"
        },
        "weapon_damage": {
          "type": "literal",
          "value": "1d12 slashing"
        },
        "weapon_damage_type": {
          "type": "literal",
          "value": "slashing"
        },
        "weapon_type": {
          "type": "literal",
          "value": "melee"
        },
        "weapon_hands": {
          "type": "literal",
          "value": "two_handed"
        },
        "weapon_prose": {
          "type": "literal",
          "value": "broadaxe"
        }
      }
    },
    {
      "ids": [
        "matched_dagger"
      ],
      "fields": {
        "weapon": {
          "type": "literal",
          "value": "twin daggers"
        },
        "weapon_desc": {
          "type": "literal",
          "value": "Twin Daggers"
        },
        "weapon_damage": {
          "type": "literal",
          "value": "1d4 piercing"
        },
        "weapon_damage_type": {
          "type": "literal",
          "value": "piercing"
        },
        "weapon_type": {
          "type": "literal",
          "value": "finesse"
        },
        "weapon_hands": {
          "type": "literal",
          "value": "one_handed"
        },
        "weapon_prose": {
          "type": "literal",
          "value": "matched daggers"
        }
      }
    },
    {
      "ids": [
        "hand_crossbow"
      ],
      "fields": {
        "weapon": {
          "type": "literal",
          "value": "hand crossbow"
        },
        "weapon_desc": {
          "type": "literal",
          "value": "Compact Hand Crossbow"
        },
        "weapon_damage": {
          "type": "literal",
          "value": "1d6 piercing"
        },
        "weapon_damage_type": {
          "type": "literal",
          "value": "piercing"
        },
        "weapon_type": {
          "type": "literal",
          "value": "ranged"
        },
        "weapon_hands": {
          "type": "literal",
          "value": "one_handed"
        },
        "weapon_prose": {
          "type": "literal",
          "value": "hand crossbow"
        }
      }
    },
    {
      "ids": [
        "bodkin_dagger"
      ],
      "fields": {
        "weapon": {
          "type": "literal",
          "value": "slim dagger"
        },
        "weapon_desc": {
          "type": "literal",
          "value": "Slim Dagger"
        },
        "weapon_damage": {
          "type": "literal",
          "value": "1d4 piercing"
        },
        "weapon_damage_type": {
          "type": "literal",
          "value": "piercing"
        },
        "weapon_type": {
          "type": "literal",
          "value": "finesse"
        },
        "weapon_hands": {
          "type": "literal",
          "value": "one_handed"
        },
        "weapon_prose": {
          "type": "literal",
          "value": "bodkin dagger"
        }
      }
    },
    {
      "ids": [
        "none"
      ],
      "fields": {
        "weapon": {
          "type": "literal",
          "value": "unarmed"
        },
        "weapon_desc": {
          "type": "literal",
          "value": "Unarmed"
        },
        "weapon_damage": {
          "type": "literal",
          "value": "1 bludgeoning"
        },
        "weapon_damage_type": {
          "type": "literal",
          "value": "bludgeoning"
        },
        "weapon_type": {
          "type": "literal",
          "value": "melee"
        },
        "weapon_hands": {
          "type": "literal",
          "value": "one_handed"
        },
        "weapon_prose": {
          "type": "literal",
          "value": "bare fists"
        }
      }
    }
  ],
  "sidearm": [
    {
      "ids": [
        "starting"
      ],
      "fields": {
        "sidearm": {
          "type": "statRef",
          "value": "starting_weapon"
        },
        "sidearm_desc": {
          "type": "statRef",
          "value": "starting_weapon_desc"
        },
        "sidearm_damage": {
          "type": "statRef",
          "value": "starting_weapon_damage"
        },
        "sidearm_damage_type": {
          "type": "statRef",
          "value": "starting_weapon_damage_type"
        },
        "sidearm_type": {
          "type": "statRef",
          "value": "starting_weapon_type"
        },
        "sidearm_hands": {
          "type": "statRef",
          "value": "starting_weapon_hands"
        },
        "sidearm_prose": {
          "type": "statRef",
          "value": "starting_weapon"
        }
      }
    },
    {
      "ids": [
        "ash_spear"
      ],
      "fields": {
        "sidearm": {
          "type": "literal",
          "value": "ash-wood spear"
        },
        "sidearm_desc": {
          "type": "literal",
          "value": "Slung Ash-Wood Spear"
        },
        "sidearm_damage": {
          "type": "literal",
          "value": "1d6/1d8 piercing"
        },
        "sidearm_damage_type": {
          "type": "literal",
          "value": "piercing"
        },
        "sidearm_type": {
          "type": "literal",
          "value": "reach"
        },
        "sidearm_hands": {
          "type": "literal",
          "value": "one_handed"
        },
        "sidearm_prose": {
          "type": "literal",
          "value": "ash spear"
        }
      }
    },
    {
      "ids": [
        "felling_axe"
      ],
      "fields": {
        "sidearm": {
          "type": "literal",
          "value": "felling axe"
        },
        "sidearm_desc": {
          "type": "literal",
          "value": "Slung Felling Axe"
        },
        "sidearm_damage": {
          "type": "literal",
          "value": "1d8 slashing"
        },
        "sidearm_damage_type": {
          "type": "literal",
          "value": "slashing"
        },
        "sidearm_type": {
          "type": "literal",
          "value": "melee"
        },
        "sidearm_hands": {
          "type": "literal",
          "value": "one_handed"
        },
        "sidearm_prose": {
          "type": "literal",
          "value": "felling axe"
        }
      }
    },
    {
      "ids": [
        "matched_dagger"
      ],
      "fields": {
        "sidearm": {
          "type": "literal",
          "value": "matched dagger"
        },
        "sidearm_desc": {
          "type": "literal",
          "value": "Matched Sidearm Dagger"
        },
        "sidearm_damage": {
          "type": "literal",
          "value": "1d4 piercing"
        },
        "sidearm_damage_type": {
          "type": "literal",
          "value": "piercing"
        },
        "sidearm_type": {
          "type": "literal",
          "value": "finesse"
        },
        "sidearm_hands": {
          "type": "literal",
          "value": "one_handed"
        },
        "sidearm_prose": {
          "type": "literal",
          "value": "matched dagger"
        }
      }
    },
    {
      "ids": [
        "hand_crossbow"
      ],
      "fields": {
        "sidearm": {
          "type": "literal",
          "value": "hand crossbow"
        },
        "sidearm_desc": {
          "type": "literal",
          "value": "Holstered Hand Crossbow"
        },
        "sidearm_damage": {
          "type": "literal",
          "value": "1d6 piercing"
        },
        "sidearm_damage_type": {
          "type": "literal",
          "value": "piercing"
        },
        "sidearm_type": {
          "type": "literal",
          "value": "ranged"
        },
        "sidearm_hands": {
          "type": "literal",
          "value": "one_handed"
        },
        "sidearm_prose": {
          "type": "literal",
          "value": "hand crossbow"
        }
      }
    },
    {
      "ids": [
        "bodkin_dagger"
      ],
      "fields": {
        "sidearm": {
          "type": "literal",
          "value": "slim dagger"
        },
        "sidearm_desc": {
          "type": "literal",
          "value": "Slim Dagger"
        },
        "sidearm_damage": {
          "type": "literal",
          "value": "1d4 piercing"
        },
        "sidearm_damage_type": {
          "type": "literal",
          "value": "piercing"
        },
        "sidearm_type": {
          "type": "literal",
          "value": "finesse"
        },
        "sidearm_hands": {
          "type": "literal",
          "value": "one_handed"
        },
        "sidearm_prose": {
          "type": "literal",
          "value": "bodkin dagger"
        }
      }
    },
    {
      "ids": [
        "timber_axe"
      ],
      "fields": {
        "sidearm": {
          "type": "literal",
          "value": "timber axe"
        },
        "sidearm_desc": {
          "type": "literal",
          "value": "Slung Hewing Axe"
        },
        "sidearm_damage": {
          "type": "literal",
          "value": "1d8 slashing"
        },
        "sidearm_damage_type": {
          "type": "literal",
          "value": "slashing"
        },
        "sidearm_type": {
          "type": "literal",
          "value": "melee"
        },
        "sidearm_hands": {
          "type": "literal",
          "value": "one_handed"
        },
        "sidearm_prose": {
          "type": "literal",
          "value": "hewing axe"
        }
      }
    },
    {
      "ids": [
        "stiletto"
      ],
      "fields": {
        "sidearm": {
          "type": "literal",
          "value": "stiletto"
        },
        "sidearm_desc": {
          "type": "literal",
          "value": "Sheathed Alderford Stiletto"
        },
        "sidearm_damage": {
          "type": "literal",
          "value": "1d4 piercing"
        },
        "sidearm_damage_type": {
          "type": "literal",
          "value": "piercing"
        },
        "sidearm_type": {
          "type": "literal",
          "value": "finesse"
        },
        "sidearm_hands": {
          "type": "literal",
          "value": "one_handed"
        },
        "sidearm_prose": {
          "type": "literal",
          "value": "stiletto"
        }
      }
    },
    {
      "ids": [
        "none"
      ],
      "fields": {
        "sidearm": {
          "type": "literal",
          "value": "none"
        },
        "sidearm_desc": {
          "type": "literal",
          "value": "None"
        },
        "sidearm_damage": {
          "type": "literal",
          "value": "none"
        },
        "sidearm_damage_type": {
          "type": "literal",
          "value": "none"
        },
        "sidearm_type": {
          "type": "literal",
          "value": "none"
        },
        "sidearm_hands": {
          "type": "literal",
          "value": "one_handed"
        },
        "sidearm_prose": {
          "type": "literal",
          "value": "empty hand"
        }
      }
    }
  ],
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
          "value": "Iron-Studded Gambeson"
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
        "buff_coat"
      ],
      "fields": {
        "armor": {
          "type": "literal",
          "value": "buff-coat"
        },
        "armor_desc": {
          "type": "literal",
          "value": "Scaled Oxhide Coat"
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
          "value": "Hardened Leather Armor"
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
          "value": "Oiled Leather Jerkin"
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
          "value": "Layered Leather Scout Wraps"
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
          "value": "Quilted Scholar's Robe"
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
          "value": "Reinforced Canvas Jacket"
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
          "value": "Tailored Travel Coat"
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
          "value": "Oiled Traveling Robes"
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
        "arming_cap"
      ],
      "fields": {
        "head_desc": {
          "type": "literal",
          "value": "Padded Linen Cap"
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
          "value": "Shadowed Mottled Hood"
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
          "value": "Scholar's Linen Cap"
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
          "value": "Cold-Hammered Skullcap"
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
          "value": "Boiled-Hide Watch Cap"
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
        "wool_mantle"
      ],
      "fields": {
        "cloak_desc": {
          "type": "literal",
          "value": "Iron Bull Wool Mantle"
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
          "value": "Weathered Mottled Cloak"
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
          "value": "Oiled Marcher Weather Cloak"
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
          "value": "Talia's Oiled Cloak"
        },
        "cloak_prose": {
          "type": "literal",
          "value": "oiled cloak"
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
        "leather_wraps"
      ],
      "fields": {
        "hands_desc": {
          "type": "literal",
          "value": "Hardened Leather Wraps"
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
          "value": "Supple Archer Bracers"
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
          "value": "Scribe's Writing Gloves"
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
          "value": "Tarred Grip Wraps"
        },
        "hands_prose": {
          "type": "literal",
          "value": "grip wraps"
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
        "soldiers_belt"
      ],
      "fields": {
        "waist_desc": {
          "type": "literal",
          "value": "Heavy Soldier's Belt"
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
          "value": "Concealed Scabbard Belt"
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
          "value": "Iron-Riveted Campaign Belt"
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
        "marching_boots"
      ],
      "fields": {
        "feet_desc": {
          "type": "literal",
          "value": "Iron-Nailed Marching Boots"
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
          "value": "Soft-Soled Scout Wraps"
        },
        "feet_prose": {
          "type": "literal",
          "value": "scout wraps"
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
          "value": "Travel Riding Boots"
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
          "value": "Talia's Pitch-Sealed Deck Boots"
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
    },
    {
      "ids": [
        "elspeth_weir_knot"
      ],
      "fields": {
        "neck_desc": {
          "type": "literal",
          "value": "Elspeth's Braided Weir-Knot"
        },
        "neck_prose": {
          "type": "literal",
          "value": "weir-knot"
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
          "value": "Customs Officer's Signet Ring"
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
          "value": "Saint Althea's River-Stone Ring"
        },
        "new_ring_prose": {
          "type": "literal",
          "value": "river-stone ring"
        }
      }
    }
  ]
};
