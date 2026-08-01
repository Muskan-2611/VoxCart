// Voice Command Parser handles English and Urdu Speech-to-Cart mappings
// Fully parsing complex phrases with numeric values, packaging identifiers, and fuzzy matches.

// Numbers translations mapping
const NUM_MAP = {
  // English words
  "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
  "eleven": 11, "twelve": 12, "dozen": 12, "half": 0.5, "couple": 2, "a": 1, "an": 1, "some": 1,

  // Urdu words & phonetic English-Urdu transcription
  "ایک": 1, "ek": 1,
  "دو": 2, "do": 2,
  "تین": 3, "teen": 3,
  "چار": 4, "char": 4,
  "پانچ": 5, "panch": 5,
  "چھ": 6, "cheh": 6, "che": 6,
  "سات": 7, "saat": 7,
  "آٹھ": 8, "aath": 8,
  "نو": 9, "nau": 9, "no": 9,
  "دس": 10, "das": 10,
  "درجن": 12, "darjan": 12, "adha": 0.5, "آدھا": 0.5
};

// Bilingual product matching patterns
const PRODUCT_DICT = [
  { id: 1,  keywords: ["milk", "whole milk", "doodh", "دودھ", "khalees doodh"] },
  { id: 2,  keywords: ["eggs", "egg", "anday", "ande", "انڈے", "anda"] },
  { id: 3,  keywords: ["cheese", "cheddar", "cheddar cheese", "paneer", "پنیر"] },
  { id: 4,  keywords: ["butter", "makkhan", "makhan", "مکھن"] },
  { id: 5,  keywords: ["bananas", "banana", "kelay", "kele", "kela", "کیلے", "کیلا"] },
  { id: 6,  keywords: ["apples", "apple", "saib", "seb", "سیب"] },
  { id: 7,  keywords: ["oranges", "orange", "maltey", "malte", "malta", "مالٹے", "مالٹا", "کینو"] },
  { id: 8,  keywords: ["mangoes", "mango", "aam", "آم"] },
  { id: 9,  keywords: ["tomatoes", "tomato", "tamatar", "ٹماٹر"] },
  { id: 10, keywords: ["potatoes", "potato", "aaloo", "aalu", "آلو"] },
  { id: 11, keywords: ["onions", "onion", "pyaaz", "piyaz", "پیاز"] },
  { id: 12, keywords: ["carrots", "carrot", "gajar", "گاجر"] },
  { id: 13, keywords: ["chicken", "chicken breast", "murghi", "murgi", "مرغی کا گوشت", "مرغی"] },
  { id: 14, keywords: ["beef", "ground beef", "qeema", "qima", "گوشت", "قیمہ"] },
  { id: 15, keywords: ["fish", "salmon", "salmon fillet", "machli", "machhli", "مچھلی کا فلیٹ", "مچھلی"] },
  { id: 16, keywords: ["water", "mineral water", "paani", "pani", "منرل واٹر", "پانی"] },
  { id: 17, keywords: ["coke", "coca-cola", "cocacola", "cola", "کوکاکولا", "کوک"] },
  { id: 18, keywords: ["tea", "green tea", "chai", "sabz chai", "سبز چائے", "چائے"] },
  { id: 19, keywords: ["rice", "white rice", "chawal", "چاول"] },
  { id: 20, keywords: ["pasta", "pasta", "پاستا"] },
  { id: 21, keywords: ["cooking oil", "oil", "tel", "tail", "koking oil", "ککنگ آئل", "تیل"] },
  { id: 22, keywords: ["sugar", "cheeni", "chini", "چینی"] },
  { id: 23, keywords: ["salt", "namak", "نمک"] }
];

// Helper to detect specific units in speech and map them to bilingually correct units
function detectUnit(text) {
  const normalized = text.toLowerCase();
  
  const unitMappings = [
    { unit: "kg", unitUr: "کلو", keywords: ["kg", "kilo", "kilos", "kilogram", "kilograms", "کلو", "کلو گرام"] },
    { unit: "g", unitUr: "گرام", keywords: ["gram", "grams", "g", "گرام"] },
    { unit: "liters", unitUr: "لیٹر", keywords: ["liter", "liters", "litre", "litres", "لیٹر", "لٹر"] },
    { unit: "ml", unitUr: "ملی لیٹر", keywords: ["ml", "milliliter", "milliliters", "millilitre", "millilitres", "mili liter", "ملی لیٹر"] },
    { unit: "dozen", unitUr: "درجن", keywords: ["dozen", "dozens", "darjan", "darjn", "درجن"] },
    { unit: "packs", unitUr: "پیکٹ", keywords: ["pack", "packs", "packet", "packets", "pekit", "پیکٹ", "پیک"] },
    { unit: "bottles", unitUr: "بوتل", keywords: ["bottle", "bottles", "botle", "botli", "botlein", "botlei", "بوتل", "بوتلیں"] },
    { unit: "boxes", unitUr: "ڈبہ", keywords: ["box", "boxes", "dabba", "dabbe", "ڈبہ", "ڈبے"] },
    { unit: "pieces", unitUr: "عدد", keywords: ["piece", "pieces", "adad", "item", "items", "عدد"] }
  ];

  for (const mapping of unitMappings) {
    for (const kw of mapping.keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(normalized)) {
        return { unit: mapping.unit, unitUr: mapping.unitUr, keyword: kw };
      }
    }
  }
  return null;
}

export function parseVoiceCommand(text, dynamicProducts = []) {
  const normalized = text.toLowerCase().trim();
  const logs = [];
  const results = [];

  // 1. Check Global utility commands (English & Urdu triggers)
  const isClearLogs = [
    "clear logs", "clear chat", "clear history", "clean logs", "clean chat",
    "لاگز صاف", "صوتی لاگز صاف", "صاف کریں", "saaf karein", "logs saaf"
  ].some(phrase => normalized.includes(phrase));

  if (isClearLogs) {
    return { action: "clear_logs", items: [], logs: [] };
  }

  // Support clear list / list clear kar do / khali kar do
  const isClear = [
    "clear", "clear cart", "empty cart", "remove everything", "clear the list", "clear list",
    "خالی", "صاف", "کارٹ خالی کریں", "cart khali", "saaf", "khali karein",
    "list clear kar do", "list clear kardo", "list khali kar do", "clear list kardo"
  ].some(phrase => normalized.includes(phrase));

  if (isClear) {
    return { action: "clear", items: [], logs: ["Cart clear trigger detected"] };
  }

  const isCheckout = [
    "checkout", "place order", "buy everything", "pay now", "done shopping",
    "آرڈر", "خریدیں", "ارڈر کریں", "آرڈر کریں", "checkout karein", "order karein", "order"
  ].some(phrase => normalized.includes(phrase));

  if (isCheckout) {
    return { action: "checkout", items: [], logs: ["Checkout/Order request detected"] };
  }

  // 2. Check Recipe & Category triggers (Expanded recipes & Category commands)
  
  // Dynamic Category Handler helper
  const tryCategoryMatch = (query, categoryKeys, catNameEn, catNameUr, defaultIds) => {
    let matchedProds = [];
    if (Array.isArray(dynamicProducts) && dynamicProducts.length > 0) {
      matchedProds = dynamicProducts.filter(p => {
        if (p.status === "Inactive" || p.status === "Unavailable" || p.status?.toLowerCase() === "inactive" || p.status?.toLowerCase() === "unavailable") return false;
        const cat = (p.category || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        return categoryKeys.some(k => cat.includes(k) || name.includes(k));
      });
    }

    if (matchedProds.length > 0) {
      return {
        action: "update_items",
        items: matchedProds.map(p => ({
          productId: p.id,
          qty: 1,
          unit: p.unit || "item",
          unitUr: p.unitUr || "عدد",
          action: "set",
          matched: true,
          name: p.name,
          nameUr: p.nameUr,
          category: p.category,
          price: (p.salePrice && p.salePrice > 0) ? p.salePrice : p.price
        })),
        logs: [`Category '${catNameEn}' (${catNameUr}) triggered! Added ${matchedProds.length} item(s) to draft: ${matchedProds.map(p => p.name).join(", ")}.`]
      };
    } else {
      return {
        action: "update_items",
        items: defaultIds.map(item => ({
          productId: item.id,
          qty: item.qty || 1,
          unit: item.unit || "item",
          unitUr: item.unitUr || "عدد",
          action: "set",
          matched: true
        })),
        logs: [`Category '${catNameEn}' triggered! Added default matched items.`]
      };
    }
  };

  // CATEGORY COMMANDS
  const isAllFruits = [
    "add all fruits", "all fruits", "healthy fruits", "healthy fruit", "fruits add karo", "phal add karo",
    "sare phal", "saare phal", "sare phalo", "saaray phal", "تمام پھل", "fruits", "fruit"
  ].some(phrase => normalized === phrase || normalized.includes(phrase));

  if (isAllFruits) {
    return tryCategoryMatch(normalized, ["fruit", "phal", "پھل"], "Fruits", "تمام پھل", [
      { id: 5, qty: 1, unit: "dozen", unitUr: "درجن" },
      { id: 6, qty: 1, unit: "kg", unitUr: "کلو" },
      { id: 7, qty: 1, unit: "dozen", unitUr: "درجن" },
      { id: 8, qty: 1, unit: "piece", unitUr: "عدد" }
    ]);
  }

  const isAllVegetables = [
    "add all vegetables", "all vegetables", "vegetables", "vegetable", "sabzi", "sabziyaan", "sabziyan", "sabzi add karo", "sari sabziyaan", "sari sabziyan", "saari sabziyan", "تمام سبزیاں"
  ].some(phrase => normalized === phrase || normalized.includes(phrase));

  if (isAllVegetables) {
    return tryCategoryMatch(normalized, ["veg", "sabzi", "سبزیاں"], "Vegetables", "تمام سبزیاں", [
      { id: 9, qty: 1, unit: "kg", unitUr: "کلو" },
      { id: 10, qty: 1, unit: "kg", unitUr: "کلو" },
      { id: 11, qty: 1, unit: "kg", unitUr: "کلو" },
      { id: 12, qty: 1, unit: "kg", unitUr: "کلو" }
    ]);
  }

  const isAllDairy = [
    "add all dairy", "all dairy", "dairy items", "sare dairy", "saari dairy", "saare dairy products", "تمام ڈیری", "ڈیری"
  ].some(phrase => normalized.includes(phrase));

  if (isAllDairy) {
    return tryCategoryMatch(normalized, ["dairy", "milk", "cheese", "butter", "doodh"], "Dairy", "تمام ڈیری", [
      { id: 1, qty: 1, unit: "pack", unitUr: "پیکٹ" },
      { id: 2, qty: 1, unit: "dozen", unitUr: "درجن" },
      { id: 3, qty: 1, unit: "pack", unitUr: "پیکٹ" },
      { id: 4, qty: 1, unit: "pack", unitUr: "پیکٹ" }
    ]);
  }

  const isAllBeverages = [
    "add all beverages", "all beverages", "all drinks", "sare drinks", "saari drinks", "drinks", "beverages", "مشروبات", "تمام مشروبات"
  ].some(phrase => normalized.includes(phrase));

  if (isAllBeverages) {
    return tryCategoryMatch(normalized, ["beverage", "drink", "water", "coke", "tea", "chai"], "Beverages", "تمام مشروبات", [
      { id: 16, qty: 1, unit: "piece", unitUr: "عدد" },
      { id: 17, qty: 1, unit: "piece", unitUr: "عدد" },
      { id: 18, qty: 1, unit: "box", unitUr: "ڈبہ" }
    ]);
  }

  const isAllMeat = [
    "add all meat", "all meat", "meat items", "sare meat", "saari meat", "گوشت", "تمام گوشت"
  ].some(phrase => normalized.includes(phrase));

  if (isAllMeat) {
    return tryCategoryMatch(normalized, ["meat", "chicken", "beef", "fish", "salmon", "qeema"], "Meat & Poultry", "تمام گوشت", [
      { id: 13, qty: 1, unit: "kg", unitUr: "کلو" },
      { id: 14, qty: 1, unit: "kg", unitUr: "کلو" },
      { id: 15, qty: 1, unit: "kg", unitUr: "کلو" }
    ]);
  }

  const isAllPantry = [
    "add all pantry", "all pantry", "pantry items", "sare pantry", "پینٹری", "تمام پینٹری"
  ].some(phrase => normalized.includes(phrase));

  if (isAllPantry) {
    return tryCategoryMatch(normalized, ["pantry", "rice", "pasta", "oil", "sugar", "salt"], "Pantry & Staples", "تمام پینٹری", [
      { id: 19, qty: 1, unit: "kg", unitUr: "کلو" },
      { id: 20, qty: 1, unit: "box", unitUr: "ڈبہ" },
      { id: 21, qty: 1, unit: "piece", unitUr: "عدد" },
      { id: 22, qty: 1, unit: "pack", unitUr: "پیکٹ" },
      { id: 23, qty: 1, unit: "pack", unitUr: "پیکٹ" }
    ]);
  }

  // RECIPE COMMANDS
  const isBiryani = [
    "chicken biryani", "biryani ke ingredients", "biryani ingredients", "ingredients for chicken biryani", "chicken biryani ingredients", "chicken biryani ke ingredients", "biryani"
  ].some(phrase => normalized.includes(phrase));

  if (isBiryani) {
    const biryaniItems = [
      { id: 13, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Chicken
      { id: 19, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Rice
      { id: 11, qty: 250, unit: "g", unitUr: "گرام", matched: true }, // Onions
      { id: 9,  qty: 250, unit: "g", unitUr: "گرام", matched: true }, // Tomatoes
      { id: 10, qty: 250, unit: "g", unitUr: "گرام", matched: true }, // Potatoes
      { id: 21, qty: 250, unit: "ml", unitUr: "ملی لیٹر", matched: true }, // Cooking oil
      { id: 23, qty: 1, unit: "packs", unitUr: "پیکٹ", matched: true }, // Salt
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Biryani Masala / Spices", nameUr: "بریانی مصالحہ", category: "Pantry" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Ginger Garlic Paste", nameUr: "ادرک لہسن کا پیسٹ", category: "Pantry" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Yogurt / Dahi", nameUr: "دہی", category: "Dairy" },
      { id: null, qty: 1, unit: "piece", unitUr: "عدد", matched: false, name: "Fresh Mint / Pudina", nameUr: "پودینہ", category: "Vegetables" }
    ];

    return {
      action: "update_items",
      items: biryaniItems.map(item => ({ ...item, action: "set", price: 1.99 })),
      logs: ["Chicken Biryani recipe triggered! Added: Chicken, Rice, Onions, Tomatoes, Potatoes, Cooking Oil, Salt. Spices, Yogurt, Ginger Garlic Paste, and Mint are marked Unavailable."]
    };
  }

  const isPulao = [
    "pulao", "chicken pulao", "mutton pulao", "beef pulao", "yakhni pulao", "pulao recipe", "pulao ingredients", "pulao ke ingredients", "پلاؤ", "پلاو"
  ].some(phrase => normalized.includes(phrase));

  if (isPulao) {
    const pulaoItems = [
      { id: 13, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Chicken
      { id: 19, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Rice
      { id: 11, qty: 500, unit: "g", unitUr: "گرام", matched: true }, // Onions
      { id: 9,  qty: 500, unit: "g", unitUr: "گرام", matched: true }, // Tomatoes
      { id: 10, qty: 500, unit: "g", unitUr: "گرام", matched: true }, // Potatoes
      { id: 21, qty: 1, unit: "liters", unitUr: "لیٹر", matched: true }, // Cooking oil
      { id: 23, qty: 1, unit: "packs", unitUr: "پیکٹ", matched: true }, // Salt
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Pulao Masala & Whole Spices", nameUr: "پلاؤ مصالحہ جات", category: "Pantry" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Ginger Garlic Paste", nameUr: "ادرک لہسن کا پیسٹ", category: "Pantry" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Yogurt / Dahi", nameUr: "دہی", category: "Dairy" }
    ];

    return {
      action: "update_items",
      items: pulaoItems.map(item => ({ ...item, action: "set", price: 1.99 })),
      logs: ["Pulao recipe triggered! Added: Chicken, Rice, Onions, Tomatoes, Potatoes, Cooking Oil, Salt. Pulao Spices, Ginger Garlic Paste, and Yogurt are marked Unavailable."]
    };
  }

  const isChai = [
    "chai", "tea recipe", "tea ingredients", "make tea", "chai ke ingredients", "چائے", "green tea"
  ].some(phrase => normalized.includes(phrase));

  if (isChai) {
    const chaiItems = [
      { id: 1, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: true }, // Whole Milk
      { id: 18, qty: 1, unit: "box", unitUr: "ڈبہ", matched: true }, // Green Tea / Chai
      { id: 22, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: true }, // Sugar
      { id: null, qty: 1, unit: "piece", unitUr: "عدد", matched: false, name: "Ginger / Adrak", nameUr: "ادرک", category: "Vegetables" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Cardamom / Elaichi", nameUr: "الائچی", category: "Pantry" }
    ];

    return {
      action: "update_items",
      items: chaiItems.map(item => ({ ...item, action: "set", price: 1.99 })),
      logs: ["Tea/Chai recipe triggered! Added: Whole Milk, Green Tea, Sugar. Ginger and Cardamom are marked Unavailable."]
    };
  }

  const isFriedRice = [
    "fried rice", "egg fried rice", "fried rice ingredients", "fried rice recipe"
  ].some(phrase => normalized.includes(phrase));

  if (isFriedRice) {
    const friedRiceItems = [
      { id: 2, qty: 1, unit: "dozen", unitUr: "درجن", matched: true }, // Eggs
      { id: 19, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Rice
      { id: 21, qty: 1, unit: "pieces", unitUr: "عدد", matched: true }, // Cooking oil
      { id: 11, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Onions
      { id: 23, qty: 1, unit: "packs", unitUr: "پیکٹ", matched: true }, // Salt
      { id: null, qty: 1, unit: "bottle", unitUr: "بوتل", matched: false, name: "Soy Sauce", nameUr: "سویا ساس", category: "Pantry" },
      { id: null, qty: 1, unit: "bottle", unitUr: "بوتل", matched: false, name: "Vinegar", nameUr: "سرکہ", category: "Pantry" },
      { id: null, qty: 1, unit: "piece", unitUr: "عدد", matched: false, name: "Garlic / Lahsan", nameUr: "لہسن", category: "Vegetables" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "White Pepper", nameUr: "سفید مرچ", category: "Pantry" }
    ];

    return {
      action: "update_items",
      items: friedRiceItems.map(item => ({ ...item, action: "set", price: 1.99 })),
      logs: ["Egg Fried Rice recipe triggered! Added: Eggs, Rice, Cooking Oil, Onions, Salt. Soy Sauce, Vinegar, Garlic, and White Pepper are marked Unavailable."]
    };
  }

  const isOmelette = [
    "omelette", "omlet", "egg omelette", "omelette recipe", "omelette ingredients"
  ].some(phrase => normalized.includes(phrase));

  if (isOmelette) {
    const omeletteItems = [
      { id: 2, qty: 1, unit: "dozen", unitUr: "درجن", matched: true }, // Eggs
      { id: 11, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Onions
      { id: 9,  qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Tomatoes
      { id: 21, qty: 1, unit: "pieces", unitUr: "عدد", matched: true }, // Cooking oil
      { id: 23, qty: 1, unit: "packs", unitUr: "پیکٹ", matched: true }, // Salt
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Green Chillies / Hari Mirch", nameUr: "ہری مرچیں", category: "Vegetables" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Black Pepper / Kali Mirch", nameUr: "کالی مرچ", category: "Pantry" },
      { id: null, qty: 1, unit: "piece", unitUr: "عدد", matched: false, name: "Coriander / Dhaniya", nameUr: "دھنیا", category: "Vegetables" }
    ];

    return {
      action: "update_items",
      items: omeletteItems.map(item => ({ ...item, action: "set", price: 1.99 })),
      logs: ["Omelette recipe triggered! Added: Eggs, Onions, Tomatoes, Cooking Oil, Salt. Green Chillies, Black Pepper, and Coriander are marked Unavailable."]
    };
  }

  const isKarahi = [
    "chicken karahi", "karahi recipe", "karahi ingredients", "karahi ke ingredients", "karahi"
  ].some(phrase => normalized.includes(phrase));

  if (isKarahi) {
    const karahiItems = [
      { id: 13, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Chicken
      { id: 9,  qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Tomatoes
      { id: 11, qty: 500, unit: "g", unitUr: "گرام", matched: true }, // Onions
      { id: 21, qty: 1, unit: "liters", unitUr: "لیٹر", matched: true }, // Cooking oil
      { id: 23, qty: 1, unit: "packs", unitUr: "پیکٹ", matched: true }, // Salt
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Karahi Masala", nameUr: "کڑاہی مصالحہ", category: "Pantry" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Ginger Garlic Paste", nameUr: "ادرک لہسن کا پیسٹ", category: "Pantry" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Green Chillies", nameUr: "ہری مرچیں", category: "Vegetables" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Yogurt / Dahi", nameUr: "دہی", category: "Dairy" }
    ];

    return {
      action: "update_items",
      items: karahiItems.map(item => ({ ...item, action: "set", price: 1.99 })),
      logs: ["Chicken Karahi recipe triggered! Added: Chicken, Tomatoes, Onions, Cooking Oil, Salt. Karahi Masala, Ginger Garlic Paste, Green Chillies, and Yogurt are marked Unavailable."]
    };
  }

  const isNihari = [
    "nihari", "beef nihari", "nihari recipe", "nihari ingredients"
  ].some(phrase => normalized.includes(phrase));

  if (isNihari) {
    const nihariItems = [
      { id: 14, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Beef
      { id: 19, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Rice
      { id: 11, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Onions
      { id: 21, qty: 1, unit: "liters", unitUr: "لیٹر", matched: true }, // Cooking oil
      { id: 23, qty: 1, unit: "packs", unitUr: "پیکٹ", matched: true }, // Salt
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Nihari Masala", nameUr: "نہاری مصالحہ", category: "Pantry" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Wheat Flour / Atta", nameUr: "آٹا", category: "Pantry" },
      { id: null, qty: 1, unit: "piece", unitUr: "عدد", matched: false, name: "Ginger / Adrak", nameUr: "ادرک", category: "Vegetables" }
    ];

    return {
      action: "update_items",
      items: nihariItems.map(item => ({ ...item, action: "set", price: 1.99 })),
      logs: ["Nihari recipe triggered! Added: Beef, White Rice, Onions, Cooking Oil, Salt. Nihari Masala, Wheat Flour, and Ginger are marked Unavailable."]
    };
  }

  const isPasta = [
    "pasta", "chicken pasta", "alfredo pasta", "pasta recipe", "pasta ingredients"
  ].some(phrase => normalized.includes(phrase));

  if (isPasta) {
    const pastaItems = [
      { id: 20, qty: 1, unit: "box", unitUr: "ڈبہ", matched: true }, // Pasta
      { id: 13, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Chicken
      { id: 3,  qty: 1, unit: "pack", unitUr: "پیکٹ", matched: true }, // Cheddar Cheese
      { id: 4,  qty: 1, unit: "pack", unitUr: "پیکٹ", matched: true }, // Butter
      { id: 1,  qty: 1, unit: "pack", unitUr: "پیکٹ", matched: true }, // Whole Milk
      { id: 21, qty: 1, unit: "liters", unitUr: "لیٹر", matched: true }, // Cooking Oil
      { id: 23, qty: 1, unit: "packs", unitUr: "پیکٹ", matched: true }, // Salt
      { id: null, qty: 1, unit: "piece", unitUr: "عدد", matched: false, name: "Garlic / Lahsan", nameUr: "لہسن", category: "Vegetables" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Black Pepper", nameUr: "کالی مرچ", category: "Pantry" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Oregano Herbs", nameUr: "اوريگانو", category: "Pantry" }
    ];

    return {
      action: "update_items",
      items: pastaItems.map(item => ({ ...item, action: "set", price: 1.99 })),
      logs: ["Chicken Pasta recipe triggered! Added: Pasta, Chicken, Cheddar Cheese, Butter, Whole Milk, Cooking Oil, Salt. Garlic, Black Pepper, and Oregano are marked Unavailable."]
    };
  }

  const isPizza = [
    "pizza", "homemade pizza", "pizza recipe", "pizza ingredients"
  ].some(phrase => normalized.includes(phrase));

  if (isPizza) {
    const pizzaItems = [
      { id: 3,  qty: 1, unit: "pack", unitUr: "پیکٹ", matched: true }, // Cheddar Cheese
      { id: 13, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Chicken
      { id: 9,  qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Tomatoes
      { id: 11, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Onions
      { id: 4,  qty: 1, unit: "pack", unitUr: "پیکٹ", matched: true }, // Butter
      { id: null, qty: 1, unit: "bottle", unitUr: "بوتل", matched: false, name: "Pizza Sauce", nameUr: "پیزا ساس", category: "Pantry" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Pizza Dough / Flour", nameUr: "پیزا ڈو", category: "Pantry" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Olives & Herbs", nameUr: "زیتون اور جڑی بوٹیاں", category: "Pantry" }
    ];

    return {
      action: "update_items",
      items: pizzaItems.map(item => ({ ...item, action: "set", price: 1.99 })),
      logs: ["Pizza recipe triggered! Added: Cheddar Cheese, Chicken, Tomatoes, Onions, Butter. Pizza Sauce, Pizza Dough, and Olives are marked Unavailable."]
    };
  }

  const isBurger = [
    "burger", "chicken burger", "burger recipe", "burger ingredients"
  ].some(phrase => normalized.includes(phrase));

  if (isBurger) {
    const burgerItems = [
      { id: 13, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Chicken
      { id: 3,  qty: 1, unit: "pack", unitUr: "پیکٹ", matched: true }, // Cheddar Cheese
      { id: 9,  qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Tomatoes
      { id: 11, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Onions
      { id: 4,  qty: 1, unit: "pack", unitUr: "پیکٹ", matched: true }, // Butter
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Burger Buns", nameUr: "برگر بنز", category: "Bakery" },
      { id: null, qty: 1, unit: "bottle", unitUr: "بوتل", matched: false, name: "Mayonnaise", nameUr: "میونیز", category: "Pantry" },
      { id: null, qty: 1, unit: "bottle", unitUr: "بوتل", matched: false, name: "Ketchup", nameUr: "کیچپ", category: "Pantry" }
    ];

    return {
      action: "update_items",
      items: burgerItems.map(item => ({ ...item, action: "set", price: 1.99 })),
      logs: ["Chicken Burger recipe triggered! Added: Chicken, Cheddar Cheese, Tomatoes, Onions, Butter. Burger Buns, Mayonnaise, and Ketchup are marked Unavailable."]
    };
  }

  const isKheer = [
    "kheer", "sweet dish", "kheer recipe", "kheer ingredients"
  ].some(phrase => normalized.includes(phrase));

  if (isKheer) {
    const kheerItems = [
      { id: 1,  qty: 1, unit: "pack", unitUr: "پیکٹ", matched: true }, // Milk
      { id: 19, qty: 1, unit: "kg", unitUr: "کلو", matched: true }, // Rice
      { id: 22, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: true }, // Sugar
      { id: 4,  qty: 1, unit: "pack", unitUr: "پیکٹ", matched: true }, // Butter
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Cardamom / Elaichi", nameUr: "الائچی", category: "Pantry" },
      { id: null, qty: 1, unit: "pack", unitUr: "پیکٹ", matched: false, name: "Dry Fruits / Pistachios & Almonds", nameUr: "میوہ جات", category: "Pantry" }
    ];

    return {
      action: "update_items",
      items: kheerItems.map(item => ({ ...item, action: "set", price: 1.99 })),
      logs: ["Kheer recipe triggered! Added: Whole Milk, White Rice, Sugar, Butter. Cardamom and Dry Fruits are marked Unavailable."]
    };
  }

  const isRecipeIngredients = [
    "recipe ingredients", "all recipe products", "all recipes", "recipe items", "recipe products", "recipe products list"
  ].some(phrase => normalized.includes(phrase));

  if (isRecipeIngredients) {
    const recipeItems = [
      { id: 19, qty: 1, unit: "kg", unitUr: "کلو" },
      { id: 20, qty: 1, unit: "box", unitUr: "ڈبہ" },
      { id: 21, qty: 1, unit: "piece", unitUr: "عدد" },
      { id: 22, qty: 1, unit: "pack", unitUr: "پیکٹ" },
      { id: 23, qty: 1, unit: "pack", unitUr: "پیکٹ" }
    ];

    return {
      action: "update_items",
      items: recipeItems.map(item => ({ ...item, action: "set", price: 1.99 })),
      logs: ["Recipe Ingredients list triggered! Added: White Rice, Pasta, Cooking Oil, Sugar, Salt."]
    };
  }

  const isHealthyFoods = [
    "healthy foods", "healthy food", "healthy items", "healthy products", "healthy groceries", "sehat bakhsh khorak"
  ].some(phrase => normalized.includes(phrase));

  if (isHealthyFoods) {
    const healthyItems = [
      { id: 18, qty: 1, unit: "box", unitUr: "ڈبہ" },
      { id: 5,  qty: 1, unit: "dozen", unitUr: "درجن" },
      { id: 6,  qty: 1, unit: "kg", unitUr: "کلو" },
      { id: 7,  qty: 1, unit: "dozen", unitUr: "درجن" },
      { id: 15, qty: 1, unit: "kg", unitUr: "کلو" },
      { id: 16, qty: 1, unit: "piece", unitUr: "عدد" }
    ];

    return {
      action: "update_items",
      items: healthyItems.map(item => ({ ...item, action: "set", price: 1.99 })),
      logs: ["Healthy Foods list triggered! Added: Green Tea, Bananas, Apples, Oranges, Salmon Fillet, Mineral Water."]
    };
  }

  // Create dictionary of products by merging hardcoded PRODUCT_DICT and any dynamic products passed in
  const dict = [...PRODUCT_DICT];
  if (Array.isArray(dynamicProducts) && dynamicProducts.length > 0) {
    dynamicProducts.forEach(dp => {
      const existing = dict.find(x => x.id === dp.id);
      const keywords = [];
      if (dp.name) keywords.push(dp.name.toLowerCase());
      if (dp.nameUr) keywords.push(dp.nameUr.toLowerCase());
      
      const nameParts = dp.name ? dp.name.toLowerCase().split(/\s+/) : [];
      nameParts.forEach(partWord => {
        if (partWord.length > 2 && !["whole", "fresh", "large", "white", "green", "cooking", "oil", "tea", "rice", "can", "packet", "box", "bottle", "per", "lb"].includes(partWord)) {
          keywords.push(partWord);
        }
      });

      if (existing) {
        keywords.forEach(kw => {
          if (!existing.keywords.includes(kw)) {
            existing.keywords.push(kw);
          }
        });
      } else {
        dict.push({
          id: dp.id,
          keywords: keywords
        });
      }
    });
  }

  // Split by items connectors, then by internal numbers/quantities
  const initialParts = normalized.split(/\s*(?:and|also|plus|اور|aur|,)\s*/i);
  const parts = [];

  for (const part of initialParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const words = trimmed.split(/\s+/);
    let currentGroup = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      const isDigit = /^\d+(?:\.\d+)?$/.test(word);
      const isNumWord = NUM_MAP[word] !== undefined;
      const isRemovalWord = [
        "remove", "delete", "cancel", "subtract",
        "ہٹائیں", "نکالیں", "hatayen", "nikalen", "hatayein", "nikalein"
      ].includes(word);

      if (i > 0 && (isDigit || isNumWord || isRemovalWord)) {
        parts.push(currentGroup.join(" "));
        currentGroup = [words[i]];
      } else {
        currentGroup.push(words[i]);
      }
    }
    if (currentGroup.length > 0) {
      parts.push(currentGroup.join(" "));
    }
  }

  // Parse each extracted part
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const isRemoval = [
      "remove", "delete", "cancel", "subtract",
      "ہٹائیں", "نکالیں", "hatayen", "nikalen", "hatayein", "nikalein"
    ].some(word => trimmed.startsWith(word) || trimmed.endsWith(word));

    let qty = 1;
    let textToMatch = trimmed;

    textToMatch = textToMatch
      .replace(/^(please\s+)?(add|get|want|need|buy|bring|i want|i need|can i have|give me|grab|pick up)\s+/g, "")
      .replace(/^(پلیز\s+)?(شامل کریں|ڈالیں|لائیں|چاہیے|دیں)\s+/g, "")
      .replace(/\s+(please|now|shamil karein|شامل کریں|karein|کریں|dalein|ڈالیں|dein|دیں|add karo|add kardo|karo)$/g, "")
      .trim();

    // Enhanced robust quantity parsing: Look for number word or digit anywhere and extract it.
    const wordsForQty = textToMatch.split(/\s+/);
    for (let i = 0; i < wordsForQty.length; i++) {
      const word = wordsForQty[i].toLowerCase();
      const num = NUM_MAP[word] !== undefined ? NUM_MAP[word] : (!isNaN(parseInt(word)) ? parseInt(word) : null);
      
      if (num !== null) {
        qty = num;
        // remove the number word/digit from textToMatch
        textToMatch = wordsForQty.filter((_, index) => index !== i).join(" ");
        break;
      }
    }

    // Capture bilingually correct units if spoken
    let unit = "item";
    let unitUr = "عدد";
    const detected = detectUnit(textToMatch);
    if (detected) {
      unit = detected.unit;
      unitUr = detected.unitUr;
      // Remove the unit word from the product name search string
      textToMatch = textToMatch.replace(new RegExp(`\\b${detected.keyword}\\b`, 'gi'), '').trim();
    }

    // Strip prepositions and Urdu genitive markers (of, for, ke, ka, ki)
    textToMatch = textToMatch
      .replace(/\b(of|for|with|and|or|ke|ka|ki|k)\b/gi, " ")
      .replace(/\s*(?:pound|pounds|lbs|lb|gallon|gallons|box|boxes|packet|packets|of|کے|کا|کی)\s+/gi, " ")
      .replace(/\s*(?:درجن|پاؤنڈ|بوتل|عدد|پیکٹ|ڈبہ|ڈبے|کلو)\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    let matchedProduct = null;
    let closestScore = 0;

    for (const prod of dict) {
      for (const keyword of prod.keywords) {
        if (textToMatch === keyword) {
          matchedProduct = prod;
          closestScore = 1;
          break;
        }
        if (textToMatch.includes(keyword) || keyword.includes(textToMatch)) {
          const score = Math.max(textToMatch.length / keyword.length, keyword.length / textToMatch.length);
          if (score > closestScore) {
            closestScore = score;
            matchedProduct = prod;
          }
        }
      }
      if (closestScore === 1) break;
    }

    if (matchedProduct) {
      results.push({
        productId: matchedProduct.id,
        qty: qty,
        unit: unit,
        unitUr: unitUr,
        action: isRemoval ? "remove" : "set",
        matchedTerm: textToMatch
      });
      const displayProd = dynamicProducts.find(x => x.id === matchedProduct.id) || PRODUCT_DICT.find(x => x.id === matchedProduct.id);
      const nameStr = displayProd ? displayProd.name : `Product #${matchedProduct.id}`;
      logs.push(`Successfully parsed: "${trimmed}" -> ${nameStr} (${isRemoval ? 'Subtract' : 'Add'} × ${qty} ${unit})`);
    } else {
      logs.push(`Could not identify product in term: "${trimmed}"`);
    }
  }

  return {
    action: results.length > 0 ? "update_items" : "unknown",
    items: results,
    logs: logs
  };
}
