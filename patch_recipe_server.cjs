const fs = require("fs");
const path = require("path");

const serverPath = path.join(__dirname, "server.ts");
let code = fs.readFileSync(serverPath, "utf8");

if (!code.includes("app.post(\"/api/recipe-search\"")) {
  const recipeFallbackCode = `
// Helper to get local recipe fallback data for offline / non-Gemini scenarios
function getLocalRecipeFallback(query: string, activeProducts: any[], lang: string) {
  const q = (query || "").toLowerCase().trim();
  
  const RECIPES_DB: Record<string, any> = {
    biryani: {
      key: "biryani",
      nameEn: "Chicken Biryani",
      nameUr: "چکن بریانی",
      category: "Main Course",
      prepTime: "25 mins",
      cookTime: "45 mins",
      servings: "4-6 persons",
      difficulty: "Medium",
      calories: "580 kcal",
      descriptionEn: "A classic festive rice dish made with aromatic basmati rice, tender chicken, and fragrant spices.",
      descriptionUr: "خوشبودار باسمتی چاول، مرغی اور روایتی مصالحوں کے ساتھ تیار کردہ مشہور ڈش۔",
      ingredients: [
        { name: "Chicken", nameUr: "مرغی کا گوشت", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Basmati Rice", nameUr: "باسمتی چاول", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Onions", nameUr: "پیاز", qty: 500, unit: "g", unitUr: "گرام" },
        { name: "Tomatoes", nameUr: "ٹماٹر", qty: 500, unit: "g", unitUr: "گرام" },
        { name: "Cooking Oil", nameUr: "ککنگ آئل", qty: 1, unit: "liter", unitUr: "لیٹر" },
        { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Biryani Masala", nameUr: "بریانی مصالحہ", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Yogurt / Dahi", nameUr: "دہی", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Marinate chicken with yogurt, biryani masala, and salt for 30 minutes.",
        "Deep fry thinly sliced onions in oil until dark golden brown; drain on paper towels.",
        "Cook marinated chicken with tomatoes until tender and gravy separates from oil.",
        "Boil basmati rice with whole spices in salted water until 80% done, then drain.",
        "Layer rice over chicken gravy, top with fried onions and mint, then steam (dum) on low heat for 15 minutes."
      ],
      instructionsUr: [
        "مرغی کے گوشت کو دہی، بریانی مصالحہ اور نمک کے ساتھ 30 منٹ میرینیٹ کریں۔",
        "باریک کٹی پیاز کو آئل میں سنہری براؤن ہونے تک فرائی کر کے الگ رکھ لیں۔",
        "ٹماٹر اور میرینیٹ شدہ چکن پکا لیں تاکہ آئل الگ ہو جائے۔",
        "چاول ابال کر 80% پکا لیں اور پانی نتھار لیں۔",
        "دیگچی میں چکن اور چاول کی تہیں لگائیں اور 15 منٹ ہلکی انچ پر دم دیں۔"
      ]
    },
    karahi: {
      key: "karahi",
      nameEn: "Chicken Karahi",
      nameUr: "چکن کڑاہی",
      category: "Main Course",
      prepTime: "15 mins",
      cookTime: "25 mins",
      servings: "3-4 persons",
      difficulty: "Easy",
      calories: "420 kcal",
      descriptionEn: "A high-heat wok dish featuring tender chicken cooked in fresh tomatoes, ginger, and green chillies.",
      descriptionUr: "تازہ ٹماٹروں، ادرک اور ہری مرچوں میں کڑاہی میں تیزی سے پکی ہوئی لذیذ چکن۔",
      ingredients: [
        { name: "Chicken", nameUr: "مرغی کا گوشت", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Tomatoes", nameUr: "ٹماٹر", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Onions", nameUr: "پیاز", qty: 250, unit: "g", unitUr: "گرام" },
        { name: "Cooking Oil", nameUr: "ککنگ آئل", qty: 1, unit: "liter", unitUr: "لیٹر" },
        { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Heat oil in a heavy karahi/wok and fry chicken with salt on high heat for 8 minutes.",
        "Add chopped fresh tomatoes and cover to let tomatoes soften completely.",
        "Uncover and stir rapidly on high flame until oil separates and gravy thickens."
      ],
      instructionsUr: [
        "کڑاہی میں آئل گرم کر کے چکن کو نمک کے ساتھ 8 منٹ ہائی فلیم پر بھونیں۔",
        "کٹے ہوئے تازہ ٹماٹر شامل کر کے ڈھانپ دیں تاکہ ٹماٹر نرم ہو جائیں۔",
        "تیز انچ پر اچھی طرح بھونیں یہاں تک کہ آئل اوپر آ جائے اور پیش کریں۔"
      ]
    },
    pasta: {
      key: "pasta",
      nameEn: "Creamy Alfredo Chicken Pasta",
      nameUr: "کریمی الفریڈو چکن پاستا",
      category: "Italian",
      prepTime: "15 mins",
      cookTime: "20 mins",
      servings: "3 persons",
      difficulty: "Easy",
      calories: "510 kcal",
      descriptionEn: "Rich penne pasta coated in smooth white butter sauce with grilled chicken and cheddar cheese.",
      descriptionUr: "چکن، مکھن، دودھ اور چیز کے کریمی وائٹ ساس میں پکا ہوا لذید پاستا۔",
      ingredients: [
        { name: "Pasta", nameUr: "پاستا", qty: 1, unit: "box", unitUr: "ڈبہ" },
        { name: "Chicken", nameUr: "مرغی کا گوشت", qty: 500, unit: "g", unitUr: "گرام" },
        { name: "Cheddar Cheese", nameUr: "پنیر", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Butter", nameUr: "مکھن", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Whole Milk", nameUr: "دودھ", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Boil pasta in salted water until al dente; drain.",
        "Sauté chicken strips in butter, add milk and grated cheese to form creamy sauce.",
        "Toss pasta into sauce and serve hot."
      ],
      instructionsUr: [
        "پاستا کو نمک والے پانی میں ابال کر نتھار لیں۔",
        "مکھن میں چکن بھونیں، دودھ اور چیز شامل کر کے کریمی ساس بنائیں۔",
        "پاستا اور کریمی ساس مکس کریں اور گرم گرم پیش کریں۔"
      ]
    },
    pizza: {
      key: "pizza",
      nameEn: "Homemade Cheese Pizza",
      nameUr: "ہوم میڈ چیز پیزا",
      category: "Fast Food",
      prepTime: "20 mins",
      cookTime: "15 mins",
      servings: "2-3 persons",
      difficulty: "Medium",
      calories: "620 kcal",
      descriptionEn: "Crispy homemade pizza loaded with rich tomato sauce, melted cheddar cheese, and chicken toppings.",
      descriptionUr: "تازہ پیزا ڈو، ٹماٹر ساس اور پگھلے ہوئے چیز کے ساتھ بہترین ہوم میڈ پیزا۔",
      ingredients: [
        { name: "Cheddar Cheese", nameUr: "پنیر", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Chicken", nameUr: "مرغی کا گوشت", qty: 500, unit: "g", unitUr: "گرام" },
        { name: "Tomatoes", nameUr: "ٹماٹر", qty: 500, unit: "g", unitUr: "گرام" },
        { name: "Onions", nameUr: "پیاز", qty: 250, unit: "g", unitUr: "گرام" },
        { name: "Butter", nameUr: "مکھن", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Roll out pizza dough on a greased baking tray.",
        "Spread pizza sauce, top with cheese, chicken, and onions.",
        "Bake in preheated oven at 220°C for 15 minutes until golden."
      ],
      instructionsUr: [
        "پیزا ڈو پھیلائیں، ساس اور چیز ٹاپ کریں۔",
        "220 ڈگری پر 15 منٹ بیک کریں۔"
      ]
    },
    omelette: {
      key: "omelette",
      nameEn: "Fluffy Egg Omelette",
      nameUr: "آملیٹ",
      category: "Breakfast",
      prepTime: "5 mins",
      cookTime: "5 mins",
      servings: "1 person",
      difficulty: "Easy",
      calories: "220 kcal",
      descriptionEn: "Quick breakfast omelette beaten with chopped onions, fresh tomatoes, and green chillies.",
      descriptionUr: "انڈے، باریک کٹی پیاز، ٹماٹر اور مرچوں سے جھٹ پٹ تیار ہونے والا ناشتہ۔",
      ingredients: [
        { name: "Eggs", nameUr: "انڈے", qty: 1, unit: "dozen", unitUr: "درجن" },
        { name: "Onions", nameUr: "پیاز", qty: 250, unit: "g", unitUr: "گرام" },
        { name: "Tomatoes", nameUr: "ٹماٹر", qty: 250, unit: "g", unitUr: "گرام" },
        { name: "Cooking Oil", nameUr: "ککنگ آئل", qty: 1, unit: "piece", unitUr: "عدد" },
        { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Whisk eggs with chopped onions, tomatoes, and salt.",
        "Heat oil in pan, pour mixture, cook for 2 minutes and flip."
      ],
      instructionsUr: [
        "انڈے، پیاز، ٹماٹر اور نمک پھینٹیں۔",
        "پین میں آئل گرم کر کے 2 منٹ فرائی کریں۔"
      ]
    }
  };

  for (const key of Object.keys(RECIPES_DB)) {
    if (q.includes(key)) {
      return RECIPES_DB[key];
    }
  }

  const cleanTitle = query.replace(/(recipe|ingredients|how to make|make|cook|dish|banane ka tarika|ke ingredients)/gi, "").trim() || "Delicious Dish";
  const capitalTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  return {
    key: cleanTitle.toLowerCase().replace(/\\s+/g, "_"),
    nameEn: capitalTitle + " Recipe",
    nameUr: capitalTitle + " کی ترکیب",
    category: "Special Dish",
    prepTime: "15 mins",
    cookTime: "25 mins",
    servings: "3-4 persons",
    difficulty: "Medium",
    calories: "450 kcal",
    descriptionEn: \`A classic \${capitalTitle} preparation made with fresh grocery ingredients.\`,
    descriptionUr: \`تازہ راشن کے سامان کے ساتھ تیار کردہ \${capitalTitle}۔\`,
    ingredients: [
      { name: "Cooking Oil", nameUr: "ککنگ آئل", qty: 1, unit: "liter", unitUr: "لیٹر" },
      { name: "Onions", nameUr: "پیاز", qty: 500, unit: "g", unitUr: "گرام" },
      { name: "Tomatoes", nameUr: "ٹماٹر", qty: 500, unit: "g", unitUr: "گرام" },
      { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" },
      { name: "White Rice", nameUr: "چاول", qty: 1, unit: "kg", unitUr: "کلو" },
      { name: "Chicken", nameUr: "مرغی کا گوشت", qty: 1, unit: "kg", unitUr: "کلو" }
    ],
    instructionsEn: [
      \`Prepare all grocery ingredients for \${capitalTitle}.\`,
      "Sauté onions and tomatoes in oil.",
      "Add main ingredients and cook until tender."
    ],
    instructionsUr: [
      \`\${capitalTitle} کے تمام درکار اجزاء اکٹھے کریں۔\`,
      "پیاز اور ٹماٹروں کو آئل میں بھونیں۔",
      "مرغی اور مصالحے شامل کر کے گلا لیں۔"
    ]
  };
}
`;

  code = recipeFallbackCode + "\n" + code;

  const endpointCode = `
  // API: AI Recipe Search & Ingredient Extraction System
  app.post("/api/recipe-search", async (req, res) => {
    const { query, lang = "en", currency = "USD" } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing query string" });
    }

    try {
      const db = getDB();
      const resolvedProducts = (db.products || []).map((p: any) => resolveProductFlatFields(p, db));
      const activeProducts = resolvedProducts.filter((p: any) => p.status !== "Inactive");

      let apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        dotenv.config();
        apiKey = process.env.GEMINI_API_KEY;
      }

      let recipeResult: any = null;

      if (apiKey) {
        try {
          console.log(\`Launching server-side Gemini Recipe Search for: "\${query}"\`);
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build"
              }
            }
          });

          const productCatalogString = activeProducts.map((p: any) => 
            \`- ID \${p.id}: "\${p.name}" (\${p.nameUr || ''}), Category: "\${p.category}", Unit: "\${p.unit || 'pack'}"\`
          ).join("\\n");

          const prompt = \`You are a culinary expert AI for VoxCart online grocery store. 
Search and retrieve the complete recipe for the requested dish/food query: "\${query}".

Available Store Products Catalog:
\${productCatalogString}

You MUST return a JSON object strictly adhering to this schema:
{
  "key": "dish_key_name",
  "nameEn": "English Recipe Title",
  "nameUr": "Urdu Recipe Title (اردو)",
  "category": "Main Course / Dessert / Snack / Beverage / Bakery / Fast Food",
  "prepTime": "15 mins",
  "cookTime": "30 mins",
  "servings": "4 persons",
  "difficulty": "Easy / Medium / Hard",
  "calories": "450 kcal",
  "descriptionEn": "Brief summary of the dish in English",
  "descriptionUr": "ڈش کی مختصر تفصیل اردو میں",
  "ingredients": [
    {
      "name": "Ingredient Name in English",
      "nameUr": "نام اردو میں",
      "qty": 1,
      "unit": "kg / g / liter / pack / piece / dozen",
      "unitUr": "کلو / گرام / لیٹر / پیکٹ / عدد / درجن",
      "matchedProductId": null
    }
  ],
  "instructionsEn": [
    "Step 1: Description...",
    "Step 2: Description..."
  ],
  "instructionsUr": [
    "مرحلہ 1: تفصیل...",
    "مرحلہ 2: تفصیل..."
  ]
}

If any ingredient matches an item in the Available Store Products Catalog above, put its exact product ID number in "matchedProductId". Otherwise leave it null.
Return ONLY valid JSON without markdown wrapping or code blocks.\`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
              temperature: 0.2
            }
          });

          const rawText = response.text || "";
          const jsonMatch = rawText.match(/\\{[\s\\S]*\\}/);
          if (jsonMatch) {
            recipeResult = JSON.parse(jsonMatch[0]);
          }
        } catch (geminiErr) {
          console.warn("Gemini recipe search failed, falling back to local recipe engine:", geminiErr);
        }
      }

      if (!recipeResult) {
        recipeResult = getLocalRecipeFallback(query, activeProducts, lang);
      }

      // Map ingredients to store products
      const processedIngredients = (recipeResult.ingredients || []).map((ing: any) => {
        let match = null;
        if (ing.matchedProductId) {
          match = activeProducts.find((p: any) => String(p.id) === String(ing.matchedProductId));
        }
        if (!match) {
          match = matchProductFuzzy(ing.name, ing.nameUr, activeProducts);
        }

        const isAvailable = match && match.status !== "Inactive" && match.status !== "Unavailable" && (match.stockQuantity === undefined || match.stockQuantity > 0) && match.price > 0;

        return {
          ...ing,
          productId: match ? match.id : (ing.matchedProductId || null),
          matched: !!isAvailable,
          price: match ? ((match.salePrice && match.salePrice > 0) ? match.salePrice : match.price) : 1.99,
          currencyCode: match ? (match.currencyCode || match.currency || "PKR") : "USD",
          category: match ? match.category : "Pantry"
        };
      });

      recipeResult.ingredients = processedIngredients;

      res.json({
        success: true,
        recipe: recipeResult
      });
    } catch (err: any) {
      console.error("Recipe search error:", err);
      res.status(500).json({ error: \`Recipe search failed: \${err.message || err.toString()}\` });
    }
  });
`;

  code = code.replace('app.post("/api/chatbot", async (req, res) => {', endpointCode + '\n  app.post("/api/chatbot", async (req, res) => {');

  fs.writeFileSync(serverPath, code, "utf8");
  console.log("Successfully patched server.ts with /api/recipe-search!");
} else {
  console.log("server.ts already has recipe-search endpoint");
}
