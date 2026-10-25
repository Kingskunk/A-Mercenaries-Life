# Cooking crafting reference

This is the first cookbook for the future Cooking craft mode.  It follows the current alchemy rule exactly: a recipe is two distinct counted ingredients, in either order.  The cooking pot will be the required tool when the mode is wired into the Craft panel; this catalogue makes no cooking action live on its own.

Every output has a dedicated, previously unmapped illustration from `ICONS/Item/Consumable/Camp_supply/Food`.  No finished dish shares its art with another cookbook dish, an alchemy output, or an existing item-icon key.  `node tools/check_cooking_recipes.js` enforces that rule.

| Recipe | Ingredients | DC | Finished-dish icon |
| --- | --- | ---: | --- |
| Salt-Roasted Boar | Boar Meat + Salt | 10 | `FOOD_Grilled_Pork_Leg_Unfaded_Icon.png` |
| Onion-Seared Venison | Venison + Onions | 10 | `FOOD_Grilled_Steak_Unfaded_Icon.png` |
| Hearth-Roast Chicken and Roots | Dressed Chicken + Root-Vegetable Bundle | 11 | `FOOD_Hearty_Dinner_Unfaded_Icon.png` |
| Riverfish Barley Pie | Fresh Fish Fillet + Grain | 11 | `FOOD_Salmon_Pie_Unfaded_Icon.png` |
| Tomato Riverfish Broth | Fresh Fish Fillet + Tomatoes | 11 | `FOOD_Seafood_Bouillabaisse_Unfaded_Icon.png` |
| Smoked Sausage and Cabbage Braise | Dried Pork Sausage + Cabbage | 10 | `FOOD_Stout_Stew_Unfaded_Icon.png` |
| Pumpkin and Onion Soup | Pumpkin + Onions | 10 | `FOOD_Pumpkin_Soup_Unfaded_Icon.png` |
| Field-Garden Stew | Root-Vegetable Bundle + Cabbage | 10 | `FOOD_Vegetable_Soup_Unfaded_Icon.png` |
| Honeyed Barley Porridge | Grain + Honeycomb | 10 | `FOOD_Fruit_Porridge_Unfaded_Icon.png` |
| Apple Barley Porridge | Grain + Orchard Apple | 10 | `FOOD_Fruit_Porridge_R_Unfaded_Icon.png` |
| Acorn-Truffle Pottage | Acorn Truffle + Potatoes | 12 | `FOOD_Mushroom_Soup_A_Unfaded_Icon.png` |
| Brambleberry Honey Tart | Brambleberry + Honeycomb | 12 | `FOOD_Berry_Tart_Unfaded_Icon.png` |

## Future implementation notes

- Keep the recipes in `web/mygame/crafting-data.js` as the runtime catalogue and update this table at the same time.
- The recipe ids are reserved output item ids.  Add their consumable records and food-use effects before enabling the Cooking tab or dispatching them through `crafting.txt`.
- Food is intended to be a proper meal, not an alchemical buff.  Its final hunger, rest, portion, spoilage, and failure rules should be chosen when the cooking action is implemented rather than implied by this catalogue.
