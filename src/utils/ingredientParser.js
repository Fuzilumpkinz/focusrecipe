/**
 * Utility functions for parsing and managing recipe ingredients
 */

/**
 * Parse a raw ingredient string into structured ingredient objects
 * @param {string} ingredientText - Raw ingredient text (e.g., "2 cups flour, sifted")
 * @returns {Object} Structured ingredient object
 */
export function parseIngredient(ingredientText) {
  if (!ingredientText || typeof ingredientText !== 'string') {
    return null;
  }

  const trimmed = ingredientText.trim();
  
  // Pattern to match quantity, unit, and name
  // Handles formats like: "2 cups flour", "1/2 tsp salt", "3 eggs", "2 15oz cans tomatoes"
  const pattern = /^(\d+(?:\/\d+)?(?:\s+\d+(?:\/\d+)?)?\s*)?([a-zA-Z°%½¾⅓⅔⅛⅜⅝\s-]*)?(.+)$/i;
  
  const match = trimmed.match(pattern);
  
  if (!match) {
    // If no match found, treat entire text as ingredient name
    return {
      quantity: '',
      unit: '',
      name: trimmed,
      notes: '',
      original: trimmed
    };
  }

  const [, quantityStr, unitStr, nameStr] = match;
  
  // Clean up the parts
  const quantity = cleanQuantity(quantityStr);
  const unit = cleanUnit(unitStr);
  const nameAndNotes = parseNameAndNotes(nameStr);
  
  return {
    quantity,
    unit,
    name: nameAndNotes.name,
    notes: nameAndNotes.notes,
    original: trimmed
  };
}

/**
 * Parse multiple ingredients from a text string or array
 * @param {string|string[]} ingredients - Raw ingredients (comma-separated string or array)
 * @returns {Array} Array of parsed ingredient objects
 */
export function parseIngredients(ingredients) {
  if (!ingredients) return [];
  
  let ingredientList = [];
  
  if (typeof ingredients === 'string') {
    // Split by commas, newlines, or semicolons
    ingredientList = ingredients.split(/[,;\n]+/).filter(item => item.trim());
  } else if (Array.isArray(ingredients)) {
    ingredientList = ingredients;
  } else {
    return [];
  }
  
  return ingredientList.map(ingredient => parseIngredient(ingredient)).filter(Boolean);
}

/**
 * Generate shopping list items from ingredients
 * @param {Array} ingredients - Array of parsed ingredient objects
 * @returns {Array} Shopping list items grouped by category
 */
export function generateShoppingList(ingredients) {
  if (!Array.isArray(ingredients)) return [];
  
  // Group ingredients by category
  const categories = {
    produce: [],
    meat: [],
    dairy: [],
    pantry: [],
    bakery: [],
    frozen: [],
    other: []
  };
  
  ingredients.forEach(ingredient => {
    const category = categorizeIngredient(ingredient);
    categories[category].push({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      checked: false,
      original: ingredient.original
    });
  });
  
  // Filter out empty categories
  return Object.entries(categories)
    .filter(([_, items]) => items.length > 0)
    .map(([category, items]) => ({
      category,
      items: items.sort((a, b) => a.name.localeCompare(b.name))
    }));
}

/**
 * Clean and standardize quantity
 * @param {string} quantityStr - Raw quantity string
 * @returns {string} Cleaned quantity
 */
function cleanQuantity(quantityStr) {
  if (!quantityStr) return '';
  
  const cleaned = quantityStr.trim().toLowerCase();
  
  // Convert fractions to decimal
  const fractionMap = {
    '¼': '0.25',
    '½': '0.5',
    '¾': '0.75',
    '⅓': '0.333',
    '⅔': '0.666',
    '⅛': '0.125',
    '⅜': '0.375',
    '⅝': '0.625',
    '⅞': '0.875'
  };
  
  let result = cleaned;
  Object.entries(fractionMap).forEach(([fraction, decimal]) => {
    result = result.replace(new RegExp(fraction, 'g'), decimal);
  });
  
  // Handle mixed numbers like "1 1/2"
  const mixedMatch = result.match(/^(\d+)\s+([0-9.]+)$/);
  if (mixedMatch) {
    const whole = parseFloat(mixedMatch[1]);
    const fraction = parseFloat(mixedMatch[2]);
    result = (whole + fraction).toString();
  }
  
  return result;
}

/**
 * Clean and standardize unit
 * @param {string} unitStr - Raw unit string
 * @returns {string} Cleaned unit
 */
function cleanUnit(unitStr) {
  if (!unitStr) return '';
  
  const cleaned = unitStr.trim().toLowerCase();
  
  // Standardize common units
  const unitMap = {
    'tbsp': 'tablespoon',
    'tbs': 'tablespoon',
    'tbl': 'tablespoon',
    'tsp': 'teaspoon',
    't': 'teaspoon',
    'oz': 'ounce',
    'lbs': 'pound',
    'lb': 'pound',
    'g': 'gram',
    'kg': 'kilogram',
    'ml': 'milliliter',
    'l': 'liter',
    'c': 'cup',
    'pt': 'pint',
    'qt': 'quart',
    'gal': 'gallon'
  };
  
  // Remove plural forms and standardize
  let unit = cleaned.replace(/s$/, ''); // Remove trailing 's'
  unit = unitMap[unit] || unit;
  
  return unit;
}

/**
 * Parse ingredient name and separate from notes/preparation instructions
 * @param {string} nameStr - Combined name and notes string
 * @returns {Object} Object with name and notes separated
 */
function parseNameAndNotes(nameStr) {
  if (!nameStr) return { name: '', notes: '' };
  
  const cleaned = nameStr.trim();
  
  // Common separators for preparation notes
  const separators = [',', '(', '-', 'for', 'chopped', 'diced', 'sliced', 'minced', 'grated'];
  
  let name = cleaned;
  let notes = '';
  
  for (const separator of separators) {
    const index = cleaned.toLowerCase().indexOf(separator);
    if (index > 0) {
      name = cleaned.substring(0, index).trim();
      notes = cleaned.substring(index).trim();
      break;
    }
  }
  
  // Clean up parentheses
  notes = notes.replace(/^\(|\)$/g, '').trim();
  
  return { name, notes };
}

/**
 * Categorize ingredient based on its name
 * @param {Object} ingredient - Parsed ingredient object
 * @returns {string} Category name
 */
function categorizeIngredient(ingredient) {
  const name = ingredient.name.toLowerCase();
  
  const produceKeywords = [
    'apple', 'banana', 'orange', 'lemon', 'lime', 'grape', 'strawberry', 'blueberry',
    'onion', 'garlic', 'potato', 'carrot', 'celery', 'lettuce', 'tomato', 'pepper',
    'broccoli', 'cauliflower', 'spinach', 'kale', 'mushroom', 'avocado', 'cucumber',
    'herb', 'basil', 'parsley', 'cilantro', 'mint', 'rosemary', 'thyme', 'oregano'
  ];
  
  const meatKeywords = [
    'chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'tuna', 'shrimp',
    'sausage', 'bacon', 'ham', 'steak', 'ground', 'breast', 'thigh', 'wing'
  ];
  
  const dairyKeywords = [
    'milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream', 'cream cheese',
    'mozzarella', 'cheddar', 'parmesan', 'feta', 'goat cheese'
  ];
  
  const pantryKeywords = [
    'flour', 'sugar', 'salt', 'pepper', 'oil', 'vinegar', 'rice', 'pasta',
    'bread', 'cereal', 'oats', 'beans', 'lentils', 'nuts', 'seeds', 'spice'
  ];
  
  const bakeryKeywords = [
    'bread', 'roll', 'bagel', 'croissant', 'muffin', 'cake', 'cookie', 'pastry'
  ];
  
  const frozenKeywords = [
    'frozen', 'ice cream', 'pizza', 'vegetables', 'fruit', 'meat'
  ];
  
  if (produceKeywords.some(keyword => name.includes(keyword))) return 'produce';
  if (meatKeywords.some(keyword => name.includes(keyword))) return 'meat';
  if (dairyKeywords.some(keyword => name.includes(keyword))) return 'dairy';
  if (bakeryKeywords.some(keyword => name.includes(keyword))) return 'bakery';
  if (frozenKeywords.some(keyword => name.includes(keyword))) return 'frozen';
  if (pantryKeywords.some(keyword => name.includes(keyword))) return 'pantry';
  
  return 'other';
}

/**
 * Format ingredient for display
 * @param {Object} ingredient - Parsed ingredient object
 * @returns {string} Formatted ingredient string
 */
export function formatIngredient(ingredient) {
  if (!ingredient) return '';
  
  const parts = [];
  
  if (ingredient.quantity) parts.push(ingredient.quantity);
  if (ingredient.unit) parts.push(ingredient.unit);
  if (ingredient.name) parts.push(ingredient.name);
  if (ingredient.notes) parts.push(`(${ingredient.notes})`);
  
  return parts.join(' ');
}

/**
 * Convert ingredients back to simple string format
 * @param {Array} ingredients - Array of parsed ingredient objects
 * @returns {Array} Array of ingredient strings
 */
export function ingredientsToStrings(ingredients) {
  if (!Array.isArray(ingredients)) return [];
  
  return ingredients.map(ingredient => {
    if (typeof ingredient === 'string') return ingredient;
    return ingredient.original || formatIngredient(ingredient);
  });
}
