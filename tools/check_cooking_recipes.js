#!/usr/bin/env node
/*
 * check_cooking_recipes.js -- cookbook outputs must stay visually distinct.
 *
 * The future Cooking mode reads its recipes from crafting-data.js and its art
 * from item-icons.js.  This check verifies that every cooking output has art,
 * does not share an image with any other recipe output, and is not reusing an
 * icon already assigned to a non-cooking item. It also checks that every dish has
 * a known tier (COOK_TIERS) and boon stat, that its two ingredients and its output
 * are catalog items, that the output is a "meal" consumable, and that no two
 * recipes use the same ingredient pair.
 *
 * Run: node tools/check_cooking_recipes.js
 */
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

global.window = {};
require(path.join(ROOT, "web", "mygame", "crafting-data.js"));
require(path.join(ROOT, "web", "mygame", "item-icons.js"));

const fs = require("fs");
const recipes = (global.window.CRAFT_RECIPES || {}).cooking || [];
const tiers = global.window.COOK_TIERS || {};
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "tools", "gear_catalog.json"), "utf8"));
const itemById = {};
catalog.items.forEach((it) => { itemById[it.id] = it; });
const pairs = new Set();
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
  if (!tiers[recipe.tier]) fail(recipe.name + " has an unknown tier " + recipe.tier);
  if (["str", "dex", "con", "int", "wis", "cha"].indexOf(recipe.stat) < 0) fail(recipe.name + " has an unknown boon stat " + recipe.stat);
  const out = itemById[recipe.id];
  if (!out) fail(recipe.name + " has no catalog item with the id " + recipe.id);
  else if (out.kind !== "consumable" || !out.effect || out.effect.type !== "meal") fail(recipe.name + "'s catalog item must be a consumable with effect type meal");
  (recipe.ingredients || []).forEach((id) => { if (!itemById[id]) fail(recipe.name + " uses unknown ingredient " + id); });
  const pair = (recipe.ingredients || []).slice().sort().join("+");
  if (pairs.has(pair)) fail(recipe.name + " repeats the ingredient pair " + pair); else pairs.add(pair);
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
console.log("OK: " + recipes.length + " cooking recipes: distinct icons, known tiers and stats, catalog items for every dish and ingredient, unique pairs");
