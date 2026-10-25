#!/usr/bin/env node
/*
 * check_cooking_recipes.js -- cookbook outputs must stay visually distinct.
 *
 * The future Cooking mode reads its recipes from crafting-data.js and its art
 * from item-icons.js.  This check verifies that every cooking output has art,
 * does not share an image with any other recipe output, and is not reusing an
 * icon already assigned to a non-cooking item.
 *
 * Run: node tools/check_cooking_recipes.js
 */
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

global.window = {};
require(path.join(ROOT, "web", "mygame", "crafting-data.js"));
require(path.join(ROOT, "web", "mygame", "item-icons.js"));

const recipes = (global.window.CRAFT_RECIPES || {}).cooking || [];
const icons = global.window.ITEM_ICONS || {};
let bad = 0;
function fail(message) { console.error("FAIL: " + message); bad++; }

if (!recipes.length) fail("no cooking recipes are registered");

const allRecipeIcons = {};
Object.keys(global.window.CRAFT_RECIPES || {}).forEach((kind) => {
  (global.window.CRAFT_RECIPES[kind] || []).forEach((recipe) => {
    if (!recipe.icon) return;
    const prior = allRecipeIcons[recipe.icon];
    if (prior) fail(recipe.name + " and " + prior.name + " reuse the icon key " + recipe.icon);
    else allRecipeIcons[recipe.icon] = { name: recipe.name, kind: kind };
  });
});

const cookingKeys = new Set(recipes.map((recipe) => recipe.icon));
const nonCookingImages = new Set(Object.keys(icons).filter((key) => !cookingKeys.has(key)).map((key) => icons[key]));
const seenImages = new Set();
recipes.forEach((recipe) => {
  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length !== 2 || recipe.ingredients[0] === recipe.ingredients[1]) {
    fail(recipe.name + " must have two distinct ingredients");
  }
  const image = icons[recipe.icon];
  if (!image) fail(recipe.name + " has no item icon for " + recipe.icon);
  else if (seenImages.has(image)) fail(recipe.name + " reuses another cooking output image");
  else if (nonCookingImages.has(image)) fail(recipe.name + " reuses an icon assigned outside the cookbook");
  else seenImages.add(image);
});

if (bad) process.exit(1);
console.log("OK: " + recipes.length + " cooking recipes use distinct, cookbook-only output icons");
