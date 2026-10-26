# Cooking crafting reference

This is the first cookbook for the future Cooking craft mode.  It follows the current alchemy rule exactly: a recipe is two distinct counted ingredients, in either order.  The cooking pot will be the required tool when the mode is wired into the Craft panel; this catalogue makes no cooking action live on its own.

Every output has a dedicated, previously unmapped illustration from `ICONS/Item/Consumable/Camp_supply/Food`.  No finished dish shares its art with another cookbook dish, an alchemy output, or an existing item-icon key.  `node tools/check_cooking_recipes.js` enforces that rule.

## Proposed meal boons

Prepared inn food currently grants a +1 ability boon for four hours. Cooking should keep the bonus at +1 and earn its advantage through duration: eight hours for ordinary recipes, twelve hours for meals using hunted meat or scarce forage. These are design targets for the eventual **eat** action, not effects applied when a dish is crafted. Boon duration is separate from how long a meal holds off hunger. A cooked meal should use the existing single food-boon slot, replacing the previous food boon rather than stacking with it. No extra healing or temporary HP is assumed in this proposal.

| Recipe | Ingredients | DC | Proposed boon on eating | Duration | Finished-dish icon |
| --- | --- | ---: | --- | ---: | --- |
| Salt-Roasted Boar | Boar Meat + Salt | 10 | +1 STR | 12 hours | `FOOD_Grilled_Pork_Leg_Unfaded_Icon.png` |
| Onion-Seared Venison | Venison + Onions | 10 | +1 DEX | 12 hours | `FOOD_Grilled_Steak_Unfaded_Icon.png` |
| Hearth-Roast Chicken and Roots | Dressed Chicken + Root-Vegetable Bundle | 11 | +1 CON | 8 hours | `FOOD_Hearty_Dinner_Unfaded_Icon.png` |
| Riverfish Barley Pie | Fish + Grain | 11 | +1 CON | 8 hours | `FOOD_Salmon_Pie_Unfaded_Icon.png` |
| Tomato Riverfish Broth | Fish + Tomatoes | 11 | +1 WIS | 8 hours | `FOOD_Seafood_Bouillabaisse_Unfaded_Icon.png` |
| Smoked Sausage and Cabbage Braise | Dried Pork Sausage + Cabbage | 10 | +1 STR | 8 hours | `FOOD_Stout_Stew_Unfaded_Icon.png` |
| Pumpkin and Onion Soup | Pumpkin + Onions | 10 | +1 WIS | 8 hours | `FOOD_Pumpkin_Soup_Unfaded_Icon.png` |
| Field-Garden Stew | Root-Vegetable Bundle + Cabbage | 10 | +1 CON | 8 hours | `FOOD_Vegetable_Soup_Unfaded_Icon.png` |
| Honeyed Barley Porridge | Grain + Honey | 10 | +1 INT | 8 hours | `FOOD_Fruit_Porridge_Unfaded_Icon.png` |
| Apple Barley Porridge | Grain + Orchard Apple | 10 | +1 CON | 8 hours | `FOOD_Fruit_Porridge_R_Unfaded_Icon.png` |
| Acorn-Truffle Pottage | Acorn Truffle + Potatoes | 12 | +1 INT | 12 hours | `FOOD_Mushroom_Soup_A_Unfaded_Icon.png` |
| Brambleberry Honey Tart | Brambleberry + Honey | 12 | +1 CHA | 12 hours | `FOOD_Berry_Tart_Unfaded_Icon.png` |

## Recipe and portion review before implementation

- **Portions are the main balance decision.** Many catalogue items already describe more than one serving: salt and grain are two-pound sacks, onions are a string of four, farm eggs come six to a basket, and honey is a jar. A whole pumpkin or chicken also needs a serving decision. One cooked serving should spend only the amount the recipe needs. Keep recipes at two *kinds* of ingredient; each can specify how many portions it uses.
- **Check the two pastry names against their inputs.** Fish + grain does not clearly make a pie, and brambleberries + honey do not make a tart without a crust. The available butter, animal fat, and grain could support a later pastry rule, or the dishes could be renamed to match what two inputs and a pot can make. The existing pie and tart illustrations should be reconsidered if the dishes are renamed.
- **Add a simple egg dish if the cookbook expands.** Farm Eggs + Onions could make Onion Egg Scramble; Farm Eggs + Cheese could make Cheese Eggs. Both use items already sold in the provision markets and give players a short, low-cost cooking path. A Dried Pork Sausage + Potatoes hash would likewise use two existing ingredients.
- **Set the cooking cost in time as well as ingredients.** The longer boon should require preparation time and a cooking pot, with the timer beginning only when the finished meal is eaten. Decide failure losses and whether cooked dishes keep in a pack before making these boons live.

## Proposed portion and resale model

Treat the existing market item as an **unopened unit** at its current price and weight. For a portioned ingredient, track unopened units and the portions left in one opened unit separately. Cooking uses the opened unit first; opening a new one moves it out of the unopened count. For example, if a four-onion string is opened and one onion is used, the pack shows three onions left, and there is no intact string to sell. Buying another string adds one unopened unit without resetting the three loose onions.

For the first implementation, shops should buy **unopened units only**. The sell menu must count only those units and label them clearly; opened ingredients remain available for cooking. This preserves existing whole-item prices and avoids fractional-copper resale and buy/sell rounding exploits. Weight should fall as portions are used. If selling leftovers is wanted later, quote the *entire opened remainder* as one lot with a single rounded price, never round each tiny portion separately.

### Proposed units and recipe costs

Each successful cooking action makes **one finished meal**. Each current recipe spends **one portion of each of its two ingredients**; the table below sets how many portions an existing market unit contains. A failed cook should never consume an entire unopened unit when only one portion was at stake. Counts are working balance values, not a change to the goods currently sold.

| Ingredient | Current unit | Proposed portions per unit | Reason |
| --- | --- | ---: | --- |
| Boar Meat | 2 lb haunch | 4 | One substantial meat serving from about half a pound. |
| Venison | 2 lb haunch | 4 | Same yield as boar meat. |
| Dressed Chicken | 3 lb whole bird | 4 | Four meal portions after bone and trimming. |
| Fish | One 0.75 lb fish | 1 | The fish is the main part of the dish. |
| Dried Pork Sausage | One short sausage | 1 | Already a single-use food item. |
| Root-Vegetable Bundle | 1 lb bundle | 2 | Half a bundle per hearty meal. |
| Grain | 2 lb sack | 8 | About a quarter pound of dry grain per porridge or crust. |
| Onions | Four-onion string | 4 | One onion per dish. |
| Potatoes | 1 lb net | 4 | About a quarter pound per pottage. |
| Tomatoes | 0.75 lb basket | 2 | Half the basket for a fish broth. |
| Cabbage | One 1.5 lb head | 4 | A quarter head per stew or braise. |
| Pumpkin | One 4 lb pumpkin | 6 | About six bowls after rind and seeds are removed. |
| Honey | One 0.5 lb jar | 8 | About one ounce to sweeten a meal. |
| Salt | 2 lb sack | 64 | A small seasoning allowance; this is a pantry staple, not a full meal component. |
| Orchard Apple | One apple | 1 | Already a single-use food item. |
| Acorn Truffle | One foraged piece | 1 | Scarce counted forage; do not divide further. |
| Brambleberry | One gathered unit | 1 | Scarce counted forage; do not divide further. |

For potential later recipes, the existing six-egg basket would contain **six egg portions**, the half-pound butter block **eight cooking portions**, and the one-pound animal-fat slab **sixteen cooking portions**. Keep the cheese wedge as **one unit** for now: it can already be eaten whole for hunger relief, so dividing it would also require a decision about that action. These future ingredients do not add recipes to the current catalogue.

The salt figure exposes a recipe-design problem: one seasoning portion costs very little and a sack lasts through many meals. Before cooking goes live, consider making salt a pantry requirement or optional seasoning rather than the entire second ingredient in Salt-Roasted Boar. This would need a different meaningful second ingredient while keeping the two-ingredient recipe rule.

The future recipe descriptions should also match serving-sized inputs: a quarter of a chicken or haunch can make one meal, while prose about roasting and consuming a whole bird or haunch would imply all four portions were spent.

### Opened state and inventory display

- Keep **unopened units** and **remaining portions in one opened unit** as separate counts for each portioned item. There is at most one opened unit of each item type; if it reaches zero, the next use opens another intact unit. Cooking always spends the opened portions first. Buying, gathering, and selling unopened units must not overwrite an opened remainder.
- Show a small **Opened** marker on the item tile whenever an opened unit exists. On hover, show both counts and the total usable portions, for example: `Grain — 2 unopened sacks; 1 opened sack with 5/8 portions left; 21 portions available`. The existing selected-item detail card should show the same line on click or tap, because hover is unavailable on touch screens. Include the counts in the tile's accessible name as well.
- The tile's normal quantity badge should count unopened units only; the Opened marker tells the player there is more usable stock. An item with zero unopened units but a nonempty opened unit must still appear in the pack. The Craft recipe view should check and display **portions available**, while the shop sell view should check and display **unopened units sellable**.
- Weight for an opened unit is its full-unit weight multiplied by `portions remaining / portions per unit`; unopened units keep their full weight. This estimate is adequate for the current abstract encumbrance system. A full unopened unit retains its existing price; opened portions are not offered for sale in the first implementation.

These are design notes only. The current inventory, shops, and crafting code still handle whole items.

## Future implementation notes

- Keep the recipes in `web/mygame/crafting-data.js` as the runtime catalogue and update this table at the same time.
- The recipe ids are reserved output item ids.  Add their consumable records and food-use effects before enabling the Cooking tab or dispatching them through `crafting.txt`.
- Food is intended to be a proper meal, not an alchemical buff. Final hunger, rest, portion, spoilage, and failure rules still need decisions when the cooking action is implemented. The boon table above is a proposal only; the game does not apply it yet.
