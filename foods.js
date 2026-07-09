/* Food database — nutrition values are per 100g unless the item is
   piece-based (primaryUnit: 'piece'), in which case cal/protein/carbs/fat
   are still expressed per 100g of that food and converted via `units`.
   Values are approximate averages, good enough for casual tracking. */

const FOOD_DB = [
  // --- Protein sources ---
  { name: 'chicken breast', aliases: ['chicken breast', 'grilled chicken', 'chicken breasts', 'chicken'], cal: 165, protein: 31, carbs: 0, fat: 3.6, defaultGrams: 150, primaryUnit: 'g' },
  { name: 'chicken thigh', aliases: ['chicken thigh', 'chicken thighs'], cal: 209, protein: 26, carbs: 0, fat: 10.9, defaultGrams: 150, primaryUnit: 'g' },
  { name: 'ground beef', aliases: ['ground beef', 'beef mince', 'minced beef', 'hamburger meat'], cal: 254, protein: 26, carbs: 0, fat: 17, defaultGrams: 150, primaryUnit: 'g' },
  { name: 'steak', aliases: ['steak', 'beef steak', 'sirloin', 'ribeye'], cal: 271, protein: 25, carbs: 0, fat: 18, defaultGrams: 200, primaryUnit: 'g' },
  { name: 'salmon', aliases: ['salmon', 'grilled salmon', 'salmon fillet'], cal: 208, protein: 20, carbs: 0, fat: 13, defaultGrams: 150, primaryUnit: 'g' },
  { name: 'tuna', aliases: ['tuna', 'canned tuna', 'tuna can'], cal: 132, protein: 28, carbs: 0, fat: 1.3, defaultGrams: 150, primaryUnit: 'g', units: { can: 142, cans: 142 } },
  { name: 'shrimp', aliases: ['shrimp', 'prawns', 'shrimps'], cal: 99, protein: 24, carbs: 0.2, fat: 0.3, defaultGrams: 120, primaryUnit: 'g' },
  { name: 'tilapia', aliases: ['tilapia', 'white fish'], cal: 96, protein: 20, carbs: 0, fat: 1.7, defaultGrams: 150, primaryUnit: 'g' },
  { name: 'turkey breast', aliases: ['turkey breast', 'turkey'], cal: 135, protein: 30, carbs: 0, fat: 1, defaultGrams: 150, primaryUnit: 'g' },
  { name: 'pork chop', aliases: ['pork chop', 'pork'], cal: 231, protein: 23, carbs: 0, fat: 14.6, defaultGrams: 150, primaryUnit: 'g' },
  { name: 'bacon', aliases: ['bacon', 'bacon strips'], cal: 541, protein: 37, carbs: 1.4, fat: 42, defaultGrams: 30, primaryUnit: 'g', units: { strip: 8, strips: 8, slice: 8, slices: 8 } },
  { name: 'egg', aliases: ['egg', 'eggs', 'boiled egg', 'fried egg', 'scrambled egg', 'scrambled eggs'], cal: 155, protein: 13, carbs: 1.1, fat: 11, defaultGrams: 50, primaryUnit: 'piece', units: { egg: 50, eggs: 50, piece: 50, pieces: 50 } },
  { name: 'egg white', aliases: ['egg white', 'egg whites'], cal: 52, protein: 11, carbs: 0.7, fat: 0.2, defaultGrams: 33, primaryUnit: 'piece', units: { egg: 33, eggs: 33 } },
  { name: 'tofu', aliases: ['tofu'], cal: 76, protein: 8, carbs: 1.9, fat: 4.8, defaultGrams: 150, primaryUnit: 'g' },
  { name: 'greek yogurt', aliases: ['greek yogurt', 'greek yoghurt'], cal: 59, protein: 10, carbs: 3.6, fat: 0.4, defaultGrams: 170, primaryUnit: 'g', units: { cup: 245, cups: 245 } },
  { name: 'yogurt', aliases: ['yogurt', 'yoghurt', 'plain yogurt'], cal: 61, protein: 3.5, carbs: 4.7, fat: 3.3, defaultGrams: 170, primaryUnit: 'g', units: { cup: 245, cups: 245 } },
  { name: 'cottage cheese', aliases: ['cottage cheese'], cal: 98, protein: 11, carbs: 3.4, fat: 4.3, defaultGrams: 150, primaryUnit: 'g', units: { cup: 226, cups: 226 } },
  { name: 'whey protein', aliases: ['whey protein', 'protein shake', 'protein powder', 'whey'], cal: 400, protein: 80, carbs: 8, fat: 6.5, defaultGrams: 30, primaryUnit: 'piece', units: { scoop: 30, scoops: 30 } },
  { name: 'protein bar', aliases: ['protein bar'], cal: 350, protein: 25, carbs: 35, fat: 12, defaultGrams: 60, primaryUnit: 'piece', units: { bar: 60, bars: 60, piece: 60, pieces: 60 } },

  // --- Legumes ---
  { name: 'black beans', aliases: ['black beans'], cal: 132, protein: 8.9, carbs: 24, fat: 0.5, defaultGrams: 150, primaryUnit: 'g', units: { cup: 172, cups: 172 } },
  { name: 'chickpeas', aliases: ['chickpeas', 'garbanzo beans'], cal: 164, protein: 9, carbs: 27, fat: 2.6, defaultGrams: 150, primaryUnit: 'g', units: { cup: 164, cups: 164 } },
  { name: 'lentils', aliases: ['lentils'], cal: 116, protein: 9, carbs: 20, fat: 0.4, defaultGrams: 150, primaryUnit: 'g', units: { cup: 198, cups: 198 } },
  { name: 'kidney beans', aliases: ['kidney beans'], cal: 127, protein: 8.7, carbs: 22.8, fat: 0.5, defaultGrams: 150, primaryUnit: 'g', units: { cup: 177, cups: 177 } },
  { name: 'edamame', aliases: ['edamame'], cal: 121, protein: 12, carbs: 8.9, fat: 5.2, defaultGrams: 100, primaryUnit: 'g', units: { cup: 155, cups: 155 } },

  // --- Carbs / grains ---
  { name: 'white rice', aliases: ['white rice', 'rice'], cal: 130, protein: 2.7, carbs: 28, fat: 0.3, defaultGrams: 180, primaryUnit: 'g', units: { cup: 158, cups: 158, bowl: 200, bowls: 200 } },
  { name: 'brown rice', aliases: ['brown rice'], cal: 123, protein: 2.7, carbs: 26, fat: 1, defaultGrams: 180, primaryUnit: 'g', units: { cup: 195, cups: 195, bowl: 200, bowls: 200 } },
  { name: 'oats', aliases: ['oats', 'oatmeal', 'porridge'], cal: 68, protein: 2.4, carbs: 12, fat: 1.4, defaultGrams: 234, primaryUnit: 'g', units: { cup: 234, cups: 234, bowl: 234, bowls: 234 } },
  { name: 'quinoa', aliases: ['quinoa'], cal: 120, protein: 4.4, carbs: 21, fat: 1.9, defaultGrams: 185, primaryUnit: 'g', units: { cup: 185, cups: 185 } },
  { name: 'pasta', aliases: ['pasta', 'spaghetti', 'noodles'], cal: 158, protein: 5.8, carbs: 31, fat: 0.9, defaultGrams: 200, primaryUnit: 'g', units: { cup: 140, cups: 140, bowl: 220, bowls: 220 } },
  { name: 'white bread', aliases: ['white bread', 'bread', 'toast'], cal: 265, protein: 9, carbs: 49, fat: 3.2, defaultGrams: 30, primaryUnit: 'piece', units: { slice: 30, slices: 30 } },
  { name: 'whole wheat bread', aliases: ['whole wheat bread', 'wholemeal bread', 'brown bread'], cal: 247, protein: 13, carbs: 41, fat: 3.4, defaultGrams: 32, primaryUnit: 'piece', units: { slice: 32, slices: 32 } },
  { name: 'bagel', aliases: ['bagel'], cal: 250, protein: 10, carbs: 49, fat: 1.5, defaultGrams: 95, primaryUnit: 'piece', units: { piece: 95, pieces: 95, bagel: 95, bagels: 95 } },
  { name: 'tortilla', aliases: ['tortilla', 'wrap'], cal: 218, protein: 5.7, carbs: 36, fat: 5.4, defaultGrams: 45, primaryUnit: 'piece', units: { piece: 45, pieces: 45, tortilla: 45, tortillas: 45, wrap: 45, wraps: 45 } },
  { name: 'potato', aliases: ['potato', 'baked potato', 'boiled potato', 'potatoes'], cal: 87, protein: 1.9, carbs: 20, fat: 0.1, defaultGrams: 200, primaryUnit: 'piece', units: { piece: 200, pieces: 200, potato: 200, potatoes: 200 } },
  { name: 'sweet potato', aliases: ['sweet potato', 'sweet potatoes'], cal: 86, protein: 1.6, carbs: 20, fat: 0.1, defaultGrams: 150, primaryUnit: 'piece', units: { piece: 150, pieces: 150 } },
  { name: 'french fries', aliases: ['french fries', 'fries', 'chips'], cal: 312, protein: 3.4, carbs: 41, fat: 15, defaultGrams: 150, primaryUnit: 'g' },
  { name: 'cereal', aliases: ['cereal', 'corn flakes'], cal: 378, protein: 7, carbs: 84, fat: 1, defaultGrams: 40, primaryUnit: 'g', units: { cup: 30, cups: 30, bowl: 40, bowls: 40 } },

  // --- Fruits ---
  { name: 'banana', aliases: ['banana', 'bananas'], cal: 89, protein: 1.1, carbs: 23, fat: 0.3, defaultGrams: 118, primaryUnit: 'piece', units: { piece: 118, pieces: 118, banana: 118, bananas: 118 } },
  { name: 'apple', aliases: ['apple', 'apples'], cal: 52, protein: 0.3, carbs: 14, fat: 0.2, defaultGrams: 182, primaryUnit: 'piece', units: { piece: 182, pieces: 182, apple: 182, apples: 182 } },
  { name: 'orange', aliases: ['orange', 'oranges'], cal: 47, protein: 0.9, carbs: 12, fat: 0.1, defaultGrams: 131, primaryUnit: 'piece', units: { piece: 131, pieces: 131, orange: 131, oranges: 131 } },
  { name: 'strawberries', aliases: ['strawberries', 'strawberry'], cal: 32, protein: 0.7, carbs: 7.7, fat: 0.3, defaultGrams: 150, primaryUnit: 'g', units: { cup: 152, cups: 152 } },
  { name: 'blueberries', aliases: ['blueberries', 'blueberry'], cal: 57, protein: 0.7, carbs: 14.5, fat: 0.3, defaultGrams: 148, primaryUnit: 'g', units: { cup: 148, cups: 148 } },
  { name: 'grapes', aliases: ['grapes'], cal: 69, protein: 0.7, carbs: 18, fat: 0.2, defaultGrams: 150, primaryUnit: 'g', units: { cup: 151, cups: 151 } },
  { name: 'mango', aliases: ['mango', 'mangoes'], cal: 60, protein: 0.8, carbs: 15, fat: 0.4, defaultGrams: 165, primaryUnit: 'piece', units: { piece: 165, pieces: 165 } },
  { name: 'watermelon', aliases: ['watermelon'], cal: 30, protein: 0.6, carbs: 7.6, fat: 0.2, defaultGrams: 200, primaryUnit: 'g', units: { cup: 152, cups: 152, slice: 286, slices: 286 } },
  { name: 'avocado', aliases: ['avocado', 'avocados'], cal: 160, protein: 2, carbs: 8.5, fat: 14.7, defaultGrams: 150, primaryUnit: 'piece', units: { piece: 150, pieces: 150, half: 75 } },
  { name: 'pineapple', aliases: ['pineapple'], cal: 50, protein: 0.5, carbs: 13, fat: 0.1, defaultGrams: 150, primaryUnit: 'g', units: { cup: 165, cups: 165 } },

  // --- Vegetables ---
  { name: 'broccoli', aliases: ['broccoli'], cal: 34, protein: 2.8, carbs: 6.6, fat: 0.4, defaultGrams: 150, primaryUnit: 'g', units: { cup: 91, cups: 91 } },
  { name: 'spinach', aliases: ['spinach'], cal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, defaultGrams: 100, primaryUnit: 'g', units: { cup: 30, cups: 30 } },
  { name: 'carrot', aliases: ['carrot', 'carrots'], cal: 41, protein: 0.9, carbs: 9.6, fat: 0.2, defaultGrams: 100, primaryUnit: 'piece', units: { piece: 61, pieces: 61 } },
  { name: 'tomato', aliases: ['tomato', 'tomatoes'], cal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, defaultGrams: 123, primaryUnit: 'piece', units: { piece: 123, pieces: 123 } },
  { name: 'cucumber', aliases: ['cucumber'], cal: 15, protein: 0.7, carbs: 3.6, fat: 0.1, defaultGrams: 150, primaryUnit: 'g' },
  { name: 'bell pepper', aliases: ['bell pepper', 'pepper', 'peppers'], cal: 31, protein: 1, carbs: 6, fat: 0.3, defaultGrams: 120, primaryUnit: 'piece', units: { piece: 120, pieces: 120 } },
  { name: 'lettuce', aliases: ['lettuce', 'salad greens'], cal: 15, protein: 1.4, carbs: 2.9, fat: 0.2, defaultGrams: 80, primaryUnit: 'g', units: { cup: 36, cups: 36 } },
  { name: 'salad', aliases: ['salad', 'side salad', 'garden salad'], cal: 20, protein: 1.5, carbs: 3.8, fat: 0.2, defaultGrams: 150, primaryUnit: 'g', units: { bowl: 200, bowls: 200 } },
  { name: 'onion', aliases: ['onion', 'onions'], cal: 40, protein: 1.1, carbs: 9.3, fat: 0.1, defaultGrams: 110, primaryUnit: 'piece', units: { piece: 110, pieces: 110 } },
  { name: 'mushroom', aliases: ['mushroom', 'mushrooms'], cal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, defaultGrams: 100, primaryUnit: 'g', units: { cup: 70, cups: 70 } },

  // --- Dairy / fats ---
  { name: 'milk', aliases: ['milk', 'whole milk'], cal: 61, protein: 3.2, carbs: 4.8, fat: 3.3, defaultGrams: 250, primaryUnit: 'g', units: { cup: 244, cups: 244, glass: 250, glasses: 250 } },
  { name: 'skim milk', aliases: ['skim milk', 'nonfat milk', 'fat free milk'], cal: 34, protein: 3.4, carbs: 5, fat: 0.1, defaultGrams: 250, primaryUnit: 'g', units: { cup: 245, cups: 245, glass: 250 } },
  { name: 'cheddar cheese', aliases: ['cheddar cheese', 'cheddar', 'cheese'], cal: 403, protein: 25, carbs: 1.3, fat: 33, defaultGrams: 30, primaryUnit: 'g', units: { slice: 20, slices: 20 } },
  { name: 'butter', aliases: ['butter'], cal: 717, protein: 0.9, carbs: 0.1, fat: 81, defaultGrams: 14, primaryUnit: 'g', units: { tbsp: 14, tablespoon: 14, tablespoons: 14 } },
  { name: 'olive oil', aliases: ['olive oil'], cal: 884, protein: 0, carbs: 0, fat: 100, defaultGrams: 14, primaryUnit: 'g', units: { tbsp: 14, tablespoon: 14, tablespoons: 14, tsp: 4.5, teaspoon: 4.5 } },
  { name: 'peanut butter', aliases: ['peanut butter'], cal: 588, protein: 25, carbs: 20, fat: 50, defaultGrams: 32, primaryUnit: 'g', units: { tbsp: 16, tablespoon: 16, tablespoons: 16 } },
  { name: 'almonds', aliases: ['almonds'], cal: 579, protein: 21, carbs: 22, fat: 50, defaultGrams: 28, primaryUnit: 'g', units: { handful: 28 } },
  { name: 'walnuts', aliases: ['walnuts'], cal: 654, protein: 15, carbs: 14, fat: 65, defaultGrams: 28, primaryUnit: 'g', units: { handful: 28 } },
  { name: 'cashews', aliases: ['cashews'], cal: 553, protein: 18, carbs: 30, fat: 44, defaultGrams: 28, primaryUnit: 'g', units: { handful: 28 } },

  // --- Prepared / misc ---
  { name: 'pizza', aliases: ['pizza', 'pizza slice'], cal: 266, protein: 11, carbs: 33, fat: 10, defaultGrams: 120, primaryUnit: 'piece', units: { slice: 120, slices: 120, piece: 120, pieces: 120 } },
  { name: 'hamburger', aliases: ['hamburger', 'burger', 'cheeseburger'], cal: 295, protein: 17, carbs: 24, fat: 14, defaultGrams: 200, primaryUnit: 'piece', units: { piece: 200, pieces: 200 } },
  { name: 'sandwich', aliases: ['sandwich'], cal: 250, protein: 12, carbs: 30, fat: 9, defaultGrams: 200, primaryUnit: 'piece', units: { piece: 200, pieces: 200 } },
  { name: 'sushi', aliases: ['sushi', 'sushi roll'], cal: 150, protein: 5.8, carbs: 30, fat: 0.5, defaultGrams: 200, primaryUnit: 'g', units: { roll: 200, rolls: 200, piece: 30, pieces: 30 } },
  { name: 'soup', aliases: ['soup'], cal: 50, protein: 2.5, carbs: 7, fat: 1.5, defaultGrams: 250, primaryUnit: 'g', units: { bowl: 250, bowls: 250, cup: 240, cups: 240 } },
  { name: 'chocolate', aliases: ['chocolate', 'chocolate bar'], cal: 546, protein: 4.9, carbs: 61, fat: 31, defaultGrams: 40, primaryUnit: 'g', units: { bar: 45, bars: 45 } },
  { name: 'ice cream', aliases: ['ice cream'], cal: 207, protein: 3.5, carbs: 24, fat: 11, defaultGrams: 100, primaryUnit: 'g', units: { scoop: 65, scoops: 65 } },
  { name: 'granola bar', aliases: ['granola bar'], cal: 471, protein: 10, carbs: 64, fat: 20, defaultGrams: 40, primaryUnit: 'piece', units: { bar: 40, bars: 40, piece: 40, pieces: 40 } },
  { name: 'hummus', aliases: ['hummus'], cal: 166, protein: 7.9, carbs: 14, fat: 9.6, defaultGrams: 60, primaryUnit: 'g', units: { tbsp: 15, tablespoon: 15 } },

  // --- Drinks ---
  { name: 'coffee', aliases: ['coffee', 'black coffee'], cal: 2, protein: 0.3, carbs: 0, fat: 0, defaultGrams: 240, primaryUnit: 'g', units: { cup: 240, cups: 240, mug: 240 } },
  { name: 'orange juice', aliases: ['orange juice', 'juice'], cal: 45, protein: 0.7, carbs: 10.4, fat: 0.2, defaultGrams: 250, primaryUnit: 'g', units: { cup: 249, cups: 249, glass: 250, glasses: 250 } },
  { name: 'soda', aliases: ['soda', 'coke', 'cola', 'soft drink'], cal: 42, protein: 0, carbs: 10.6, fat: 0, defaultGrams: 330, primaryUnit: 'piece', units: { can: 330, cans: 330, bottle: 500, bottles: 500 } },
  { name: 'beer', aliases: ['beer'], cal: 43, protein: 0.5, carbs: 3.6, fat: 0, defaultGrams: 355, primaryUnit: 'piece', units: { can: 355, cans: 355, bottle: 355, bottles: 355, glass: 355 } },
  { name: 'wine', aliases: ['wine', 'red wine', 'white wine'], cal: 83, protein: 0.1, carbs: 2.6, fat: 0, defaultGrams: 150, primaryUnit: 'g', units: { glass: 150, glasses: 150 } },
];

// Global mass/volume unit words -> grams (used when a food doesn't define
// its own unit conversion, e.g. "300g chicken" or "6oz salmon").
const GLOBAL_UNITS = {
  g: 1, gram: 1, grams: 1, gr: 1,
  kg: 1000, kilogram: 1000, kilograms: 1000,
  oz: 28.35, ounce: 28.35, ounces: 28.35,
  lb: 453.6, lbs: 453.6, pound: 453.6, pounds: 453.6,
  ml: 1, milliliter: 1, millilitre: 1, milliliters: 1,
  l: 1000, liter: 1000, litre: 1000, liters: 1000,
};

const NUMBER_WORDS = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, half: 0.5, couple: 2, few: 3,
};

if (typeof module !== 'undefined') {
  module.exports = { FOOD_DB, GLOBAL_UNITS, NUMBER_WORDS };
}
