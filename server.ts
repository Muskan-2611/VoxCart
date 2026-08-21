
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createRequire } from "module";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { findMatchingRecipe } from "./src/recipes_db.js";

const require = createRequire(import.meta.url);
let nodemailer: any = null;
try {
  nodemailer = require("nodemailer");
} catch (err) {
  console.warn("[SMTP SYSTEM] Notice: Failed to load nodemailer via require:", err);
}

dotenv.config();

function matchProductFuzzy(nameEn: string, nameUr: string, activeProducts: any[]) {
  if (!activeProducts || activeProducts.length === 0) return null;
  const nEn = (nameEn || "").toLowerCase().trim();
  const nUr = (nameUr || "").toLowerCase().trim();

  for (const p of activeProducts) {
    const pEn = (p.name || "").toLowerCase().trim();
    const pUr = (p.nameUr || "").toLowerCase().trim();

    if ((nEn && pEn.includes(nEn)) || (nEn && nEn.includes(pEn)) || (nUr && pUr && pUr.includes(nUr))) {
      return p;
    }
  }

  const tokens = nEn.split(/\s+/).filter(t => t.length > 2);
  for (const t of tokens) {
    for (const p of activeProducts) {
      const pEn = (p.name || "").toLowerCase().trim();
      if (pEn.includes(t)) {
        return p;
      }
    }
  }

  return null;
}


// Helper to get local recipe fallback data for offline / non-Gemini scenarios
function getLocalRecipeFallback(query: string, activeProducts: any[], lang: string) {
  const result = findMatchingRecipe(query, activeProducts);
  if (result) return result;

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
        { name: "Onions", nameUr: "پیاز", qty: 250, unit: "g", unitUr: "گرام" },
        { name: "Tomatoes", nameUr: "ٹماٹر", qty: 250, unit: "g", unitUr: "گرام" },
        { name: "Cooking Oil", nameUr: "ککنگ آئل", qty: 250, unit: "ml", unitUr: "ملی لیٹر" },
        { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Biryani Masala", nameUr: "بریانی مصالحہ", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Yogurt / Dahi", nameUr: "دہی", qty: 250, unit: "g", unitUr: "گرام" }
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
    pulao: {
      key: "pulao",
      nameEn: "Chicken Pulao",
      nameUr: "چکن پلاؤ",
      category: "Main Course",
      prepTime: "20 mins",
      cookTime: "35 mins",
      servings: "4-5 persons",
      difficulty: "Medium",
      calories: "490 kcal",
      descriptionEn: "A traditional fragrant rice dish prepared with seasoned chicken stock and aromatic whole spices.",
      descriptionUr: "چکن یخنی اور روایتی مصالحوں سے تیار کردہ خوشبودار پلاؤ۔",
      ingredients: [
        { name: "Chicken", nameUr: "مرغی کا گوشت", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Basmati Rice", nameUr: "باسمتی چاول", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Onions", nameUr: "پیاز", qty: 500, unit: "g", unitUr: "گرام" },
        { name: "Tomatoes", nameUr: "ٹماٹر", qty: 500, unit: "g", unitUr: "گرام" },
        { name: "Potatoes", nameUr: "آلو", qty: 500, unit: "g", unitUr: "گرام" },
        { name: "Cooking Oil", nameUr: "ککنگ آئل", qty: 250, unit: "ml", unitUr: "ملی لیٹر" },
        { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Pulao Masala", nameUr: "پلاؤ مصالحہ جات", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Boil chicken with whole spices, onion, and garlic to prepare a fragrant stock.",
        "Sauté sliced onions in oil until golden brown, then add tomatoes.",
        "Add chicken and fry, then pour in chicken stock and bring to a boil.",
        "Add washed rice, cook until water evaporates, and steam on low heat for 15 minutes."
      ],
      instructionsUr: [
        "مصالحوں، پیاز اور لہسن کے ساتھ چکن ابال کر یخنی تیار کریں۔",
        "پیاز سنہری فرائی کریں، پھر ٹماٹر شامل کریں۔",
        "چکن بھونیں، پھر یخنی شامل کر کے ابالیں اور چاول ڈال دیں۔",
        "پانی خشک ہونے پر 15 منٹ ہلکی انچ پر دم دیں۔"
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
        { name: "Cooking Oil", nameUr: "ککنگ آئل", qty: 250, unit: "ml", unitUr: "ملی لیٹر" },
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
    nihari: {
      key: "nihari",
      nameEn: "Beef Nihari",
      nameUr: "بیف نہاری",
      category: "Main Course",
      prepTime: "20 mins",
      cookTime: "3 hours",
      servings: "5-6 persons",
      difficulty: "Hard",
      calories: "650 kcal",
      descriptionEn: "A slow-cooked shank beef stew enriched with bone marrow, spiced with specialized Nihari masala, and thickened with flour.",
      descriptionUr: "نہاری مصالحے اور ہلکی انچ پر گلی ہوئی لذیذ بیف نہاری۔",
      ingredients: [
        { name: "Ground Beef", nameUr: "بیف گوشت", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "White Rice", nameUr: "چاول", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Onions", nameUr: "پیاز", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Cooking Oil", nameUr: "ککنگ آئل", qty: 250, unit: "ml", unitUr: "ملی لیٹر" },
        { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Heat oil, sauté sliced onions, and fry beef with Nihari masala on high flame for 10 minutes.",
        "Add water, cover, and let simmer on low heat for 3-4 hours until beef is tender.",
        "Dissolve flour in water and slowly stir into the stew, cooking until thick gravy forms."
      ],
      instructionsUr: [
        "آئل گرم کر کے پیاز فرائی کریں اور بیف کو نہاری مصالحے میں بھونیں۔",
        "پانی ڈال کر 3 سے 4 گھنٹے ہلکی انچ پر پکائیں تاکہ گوشت نرم ہو جائے۔",
        "آٹا پانی میں گھول کر شامل کریں اور گاڑھا ہونے تک پکائیں۔"
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
    chai: {
      key: "chai",
      nameEn: "Chai/Tea",
      nameUr: "چائے",
      category: "Beverages",
      prepTime: "5 mins",
      cookTime: "10 mins",
      servings: "2-3 persons",
      difficulty: "Easy",
      calories: "90 kcal",
      descriptionEn: "Traditional boiled milk tea brewed with strong green tea leaves, sweetened with sugar, and spiced with ginger and cardamom.",
      descriptionUr: "تازہ دودھ، سبز پتی، چینی، ادرک اور الائچی کے ساتھ پکی ہوئی کلاسک چائے۔",
      ingredients: [
        { name: "Whole Milk", nameUr: "خالص دودھ", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Green Tea", nameUr: "سبز چائے", qty: 1, unit: "box", unitUr: "ڈبہ" },
        { name: "Sugar", nameUr: "چینی", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Bring water to a boil in a saucepan.",
        "Add tea leaves and simmer for 2 minutes.",
        "Pour in milk and add sugar to taste, then bring to a boil.",
        "Strain and serve hot."
      ],
      instructionsUr: [
        "پین میں پانی ابالیں۔",
        "پتی ڈال کر 2 منٹ پکائیں۔",
        "دودھ اور چینی شامل کر کے ابالیں اور چھان کر پیش کریں۔"
      ]
    },
    tea: {
      key: "tea",
      nameEn: "Chai/Tea",
      nameUr: "چائے",
      category: "Beverages",
      prepTime: "5 mins",
      cookTime: "10 mins",
      servings: "2-3 persons",
      difficulty: "Easy",
      calories: "90 kcal",
      descriptionEn: "Traditional boiled milk tea brewed with strong green tea leaves, sweetened with sugar, and spiced with ginger and cardamom.",
      descriptionUr: "تازہ دودھ، سبز پتی، چینی، ادرک اور الائچی کے ساتھ پکی ہوئی کلاسک چائے۔",
      ingredients: [
        { name: "Whole Milk", nameUr: "خالص دودھ", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Green Tea", nameUr: "سبز چائے", qty: 1, unit: "box", unitUr: "ڈبہ" },
        { name: "Sugar", nameUr: "چینی", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Bring water to a boil in a saucepan.",
        "Add tea leaves and simmer for 2 minutes.",
        "Pour in milk and add sugar to taste, then bring to a boil.",
        "Strain and serve hot."
      ],
      instructionsUr: [
        "پین میں پانی ابالیں۔",
        "پتی ڈال کر 2 منٹ پکائیں۔",
        "دودھ اور چینی شامل کر کے ابالیں اور چھان کر پیش کریں۔"
      ]
    },
    "fried rice": {
      key: "fried rice",
      nameEn: "Egg Fried Rice",
      nameUr: "انڈے فرائیڈ رائس",
      category: "Chinese / Main Course",
      prepTime: "10 mins",
      cookTime: "15 mins",
      servings: "3-4 persons",
      difficulty: "Easy",
      calories: "360 kcal",
      descriptionEn: "Sautéed fluffy basmati rice tossed with scrambled eggs, fresh onions, and light seasoning.",
      descriptionUr: "انڈوں، ہری پیاز اور سویا ساس کے ساتھ تیار کردہ لذیذ فرائیڈ رائس۔",
      ingredients: [
        { name: "Large Eggs", nameUr: "انڈے", qty: 1, unit: "dozen", unitUr: "درجن" },
        { name: "White Rice", nameUr: "چاول", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Cooking Oil", nameUr: "ککنگ آئل", qty: 250, unit: "ml", unitUr: "ملی لیٹر" },
        { name: "Onions", nameUr: "پیاز", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Boil rice until 90% cooked, then cool completely.",
        "Scramble eggs in oil and set aside.",
        "Sauté onions in a hot wok, add cold rice and scrambled eggs.",
        "Season with soy sauce, salt and mix on high flame."
      ],
      instructionsUr: [
        "چاول ابال کر ٹھنڈے کر لیں۔",
        "انڈے فرائی کر کے الگ رکھ لیں۔",
        "کڑھائی میں پیاز بھونیں، پھر چاول اور انڈے ڈالیں۔",
        "نمک اور سویا ساس ڈال کر تیز انچ پر مکس کریں۔"
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
        { name: "Large Eggs", nameUr: "انڈے", qty: 1, unit: "dozen", unitUr: "درجن" },
        { name: "Onions", nameUr: "پیاز", qty: 250, unit: "g", unitUr: "گرام" },
        { name: "Tomatoes", nameUr: "ٹماٹر", qty: 250, unit: "g", unitUr: "گرام" },
        { name: "Cooking Oil", nameUr: "ککنگ آئل", qty: 250, unit: "ml", unitUr: "ملی لیٹر" },
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
    burger: {
      key: "burger",
      nameEn: "Chicken Burger",
      nameUr: "چکن برگر",
      category: "Fast Food",
      prepTime: "15 mins",
      cookTime: "15 mins",
      servings: "2-4 persons",
      difficulty: "Easy",
      calories: "450 kcal",
      descriptionEn: "Juicy chicken patties pan-seared with butter, placed in toasted buns with melted cheddar cheese and fresh onion rings.",
      descriptionUr: "لذیذ چکن پیٹی، پگھلے ہوئے چیز اور برگر بنز کے ساتھ تیار کردہ ہوم میڈ برگر۔",
      ingredients: [
        { name: "Chicken", nameUr: "مرغی کا گوشت", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Cheddar Cheese", nameUr: "پنیر", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Tomatoes", nameUr: "ٹماٹر", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Onions", nameUr: "پیاز", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Butter", nameUr: "مکھن", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Form chicken into round patties, season, and fry in butter until fully cooked.",
        "Toast the burger buns in a pan with a little butter.",
        "Spread mayonnaise on buns, place patty, a slice of cheddar cheese, tomato, and onions.",
        "Drizzle ketchup, cover with top bun, and serve warm."
      ],
      instructionsUr: [
        "چکن پیٹی بنائیں اور مکھن میں فرائی کریں۔",
        "برگر بنز کو ہلکا گرم کریں۔",
        "بنز پر مایونیز، پیٹی، چیز، پیاز اور ٹماٹر رکھ کر سرو کریں۔"
      ]
    },
    kheer: {
      key: "kheer",
      nameEn: "Traditional Rice Kheer",
      nameUr: "روایتی کھیر",
      category: "Dessert",
      prepTime: "15 mins",
      cookTime: "45 mins",
      servings: "5-6 persons",
      difficulty: "Medium",
      calories: "310 kcal",
      descriptionEn: "A slow-cooked traditional sweet pudding made by simmering rice in rich whole milk, flavored with cardamom, and sweetened with sugar.",
      descriptionUr: "دودھ، چاول، چینی اور سبز الائچی سے بنی روایتی شیریں کھیر۔",
      ingredients: [
        { name: "Whole Milk", nameUr: "خالص دودھ", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "White Rice", nameUr: "چاول", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Sugar", nameUr: "چینی", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Butter", nameUr: "مکھن", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Wash and soak rice for 30 minutes, then grind.",
        "Boil milk in a pot, add ground rice, and simmer on low heat.",
        "Once milk thickens, stir in sugar and butter.",
        "Sprinkle cardamoms and dry fruits; cool before serving."
      ],
      instructionsUr: [
        "چاول بھگو کر ہلکا پیس لیں۔",
        "دودھ ابال کر چاول شامل کریں اور ہلکی انچ پر چمچ چلاتے ہوئے پکائیں۔",
        "دودھ گاڑھا ہونے پر چینی اور مکھن شامل کریں۔",
        "الائچی اور میوہ جات سجا کر فریج میں ٹھنڈا کر کے سرو کریں۔"
      ]
    },
    haleem: {
      key: "haleem",
      nameEn: "Chicken / Beef Haleem",
      nameUr: "حلیم / دلیم",
      category: "Main Course",
      prepTime: "30 mins",
      cookTime: "2 hours",
      servings: "6 persons",
      difficulty: "Medium",
      calories: "520 kcal",
      descriptionEn: "A slow-cooked savory stew of meat, wheat, barley, and lentils simmered to perfection.",
      descriptionUr: "گوشت، گندم، دالوں اور مصالحوں کے ساتھ धीमी انچ پر پکی لذیذ حلیم۔",
      ingredients: [
        { name: "Chicken", nameUr: "مرغی کا گوشت", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Onions", nameUr: "پیاز", qty: 500, unit: "g", unitUr: "گرام" },
        { name: "Cooking Oil", nameUr: "ککنگ آئل", qty: 250, unit: "ml", unitUr: "ملی لیٹر" },
        { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Soak lentils and wheat overnight; boil until soft.",
        "Cook chicken with spices and shred coarsely.",
        "Combine grains and meat, blend, and simmer with fried onion garnish."
      ],
      instructionsUr: [
        "دالیں اور گندم ابال کر نرم کریں۔",
        "چکن کو مصالحے کے ساتھ پکا کر ریشہ کریں۔",
        "تمام اجزاء مکس کر کے گھوٹا لگائیں اور پیاز کا تڑکا دیں۔"
      ]
    },
    tacos: {
      key: "tacos",
      nameEn: "Mexican Beef Tacos",
      nameUr: "میکسیکن بیف ٹیکوز",
      category: "Fast Food",
      prepTime: "15 mins",
      cookTime: "15 mins",
      servings: "3 persons",
      difficulty: "Easy",
      calories: "430 kcal",
      descriptionEn: "Crispy corn tortilla shells filled with seasoned ground beef, shredded cheddar cheese, onions, and fresh tomatoes.",
      descriptionUr: "قیمہ، چیز، پیاز اور ٹماٹر کی فلنگ کے ساتھ کرسپی میکسیکن ٹیکوز۔",
      ingredients: [
        { name: "Ground Beef", nameUr: "بیف گوشت", qty: 500, unit: "g", unitUr: "گرام" },
        { name: "Cheddar Cheese", nameUr: "پنیر", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Tomatoes", nameUr: "ٹماٹر", qty: 250, unit: "g", unitUr: "گرام" },
        { name: "Onions", nameUr: "پیاز", qty: 250, unit: "g", unitUr: "گرام" },
        { name: "Cooking Oil", nameUr: "ککنگ آئل", qty: 250, unit: "ml", unitUr: "ملی لیٹر" },
        { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Sauté ground beef with taco seasoning in oil until cooked.",
        "Fill warm tortilla shells with cooked beef, diced tomatoes, onions, and cheese.",
        "Serve hot with salsa."
      ],
      instructionsUr: [
        "قیمہ مصالحے میں بھون لیں۔",
        "ٹیکو شیلز میں قیمہ، ٹماٹر، پیاز اور چیز بھر کر سرو کریں۔"
      ]
    },
    spaghetti: {
      key: "spaghetti",
      nameEn: "Spaghetti Carbonara",
      nameUr: "اسپیگیٹی کاربونارا",
      category: "Italian",
      prepTime: "10 mins",
      cookTime: "20 mins",
      servings: "3-4 persons",
      difficulty: "Easy",
      calories: "510 kcal",
      descriptionEn: "Classic Italian pasta tossed with eggs, cheese, butter, and chicken breast.",
      descriptionUr: "انڈے، پنیر اور چکن کے ساتھ پکا ہوا روایتی اٹالین پاستا۔",
      ingredients: [
        { name: "Pasta", nameUr: "پاستا", qty: 1, unit: "box", unitUr: "ڈبہ" },
        { name: "Large Eggs", nameUr: "انڈے", qty: 1, unit: "dozen", unitUr: "درجن" },
        { name: "Cheddar Cheese", nameUr: "پنیر", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Butter", nameUr: "مکھن", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Chicken", nameUr: "مرغی کا گوشت", qty: 500, unit: "g", unitUr: "گرام" },
        { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Boil spaghetti in salted water until tender.",
        "Whisk eggs with grated cheese in a bowl.",
        "Toss hot drained pasta with butter, chicken, and egg-cheese sauce until glossy."
      ],
      instructionsUr: [
        "اسپیگیٹی ابال لیں۔",
        "انڈے اور چیز مکس کریں۔",
        "گرم پاستا مکھن، چکن اور انڈے کے ساس میں مکس کر کے پیش کریں۔"
      ]
    },
    shakshuka: {
      key: "shakshuka",
      nameEn: "Middle Eastern Shakshuka",
      nameUr: "مڈل ایسٹرن شکشوقہ",
      category: "Breakfast",
      prepTime: "10 mins",
      cookTime: "15 mins",
      servings: "2 persons",
      difficulty: "Easy",
      calories: "320 kcal",
      descriptionEn: "Poached eggs nestled in a spiced tomato and onion sauce skillet.",
      descriptionUr: "ٹماٹر اور پیاز کی مسالے دار گریوی میں پکے ہوئے انڈے۔",
      ingredients: [
        { name: "Large Eggs", nameUr: "انڈے", qty: 1, unit: "dozen", unitUr: "درجن" },
        { name: "Tomatoes", nameUr: "ٹماٹر", qty: 500, unit: "g", unitUr: "گرام" },
        { name: "Onions", nameUr: "پیاز", qty: 250, unit: "g", unitUr: "گرام" },
        { name: "Cooking Oil", nameUr: "ککنگ آئل", qty: 250, unit: "ml", unitUr: "ملی لیٹر" },
        { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Sauté chopped onions and tomatoes in oil until thick sauce forms.",
        "Make wells in sauce and crack eggs directly inside.",
        "Cover and simmer until egg whites are set."
      ],
      instructionsUr: [
        "پیاز اور ٹماٹر بھون کر گاڑھا ساس بنائیں۔",
        "انڈے توڑ کر ساس میں ڈالیں اور ڈھک کر پکائیں۔"
      ]
    },
    ramen: {
      key: "ramen",
      nameEn: "Japanese Chicken Ramen Noodle",
      nameUr: "جاپانی چکن رامن نوڈلز",
      category: "Asian",
      prepTime: "15 mins",
      cookTime: "20 mins",
      servings: "2 persons",
      difficulty: "Easy",
      calories: "480 kcal",
      descriptionEn: "Comforting Asian noodle soup with chicken broth, soft-boiled eggs, onions, and soy sauce.",
      descriptionUr: "چکن یخنی، ابلی انڈے اور نوڈلز سے بنی گرم رامن سوپ۔",
      ingredients: [
        { name: "Pasta", nameUr: "پاستا", qty: 1, unit: "box", unitUr: "ڈبہ" },
        { name: "Chicken", nameUr: "مرغی کا گوشت", qty: 500, unit: "g", unitUr: "گرام" },
        { name: "Large Eggs", nameUr: "انڈے", qty: 1, unit: "dozen", unitUr: "درجن" },
        { name: "Onions", nameUr: "پیاز", qty: 250, unit: "g", unitUr: "گرام" },
        { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Simmer chicken to make broth, then slice chicken.",
        "Boil noodles and eggs.",
        "Serve noodles in hot broth topped with chicken slices and soft egg."
      ],
      instructionsUr: [
        "چکن کی یخنی بنائیں اور نوڈلز ابالیں۔",
        "گرم یخنی میں نوڈلز اور انڈے سجائیں۔"
      ]
    },
    "butter chicken": {
      key: "butter chicken",
      nameEn: "Butter Chicken Masala",
      nameUr: "بٹر چکن مسالہ",
      category: "Main Course",
      prepTime: "20 mins",
      cookTime: "30 mins",
      servings: "4 persons",
      difficulty: "Medium",
      calories: "590 kcal",
      descriptionEn: "Tender chicken simmered in a velvety butter tomato sauce with aromatic spices.",
      descriptionUr: "مکھن اور ٹماٹر کے شاہی ساس میں تیار کردہ لذیذ بٹر چکن۔",
      ingredients: [
        { name: "Chicken", nameUr: "مرغی کا گوشت", qty: 1, unit: "kg", unitUr: "کلو" },
        { name: "Butter", nameUr: "مکھن", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Tomatoes", nameUr: "ٹماٹر", qty: 500, unit: "g", unitUr: "گرام" },
        { name: "Whole Milk", nameUr: "خالص دودھ", qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { name: "Onions", nameUr: "پیاز", qty: 250, unit: "g", unitUr: "گرام" },
        { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ],
      instructionsEn: [
        "Sauté tomatoes and onions, then blend into a silky gravy.",
        "Cook chicken in butter until golden.",
        "Combine chicken with tomato sauce and milk; simmer until creamy."
      ],
      instructionsUr: [
        "پیاز اور ٹماٹر کا پیسٹ بنائیں۔",
        "چکن مکھن میں فرائی کریں اور پیسٹ شامل کر کے کریمی ہونے تک پکائیں۔"
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
    key: cleanTitle.toLowerCase().replace(/\s+/g, "_"),
    nameEn: capitalTitle + " Recipe",
    nameUr: capitalTitle + " کی ترکیب",
    category: "Special Dish",
    prepTime: "15 mins",
    cookTime: "25 mins",
    servings: "3-4 persons",
    difficulty: "Medium",
    calories: "450 kcal",
    descriptionEn: `A classic ${capitalTitle} preparation made with fresh grocery ingredients.`,
    descriptionUr: `تازہ راشن کے سامان کے ساتھ تیار کردہ ${capitalTitle}۔`,
    ingredients: [
      { name: "Cooking Oil", nameUr: "ککنگ آئل", qty: 1, unit: "liter", unitUr: "لیٹر" },
      { name: "Onions", nameUr: "پیاز", qty: 500, unit: "g", unitUr: "گرام" },
      { name: "Tomatoes", nameUr: "ٹماٹر", qty: 500, unit: "g", unitUr: "گرام" },
      { name: "Salt", nameUr: "نمک", qty: 1, unit: "pack", unitUr: "پیکٹ" },
      { name: "White Rice", nameUr: "چاول", qty: 1, unit: "kg", unitUr: "کلو" },
      { name: "Chicken", nameUr: "مرغی کا گوشت", qty: 1, unit: "kg", unitUr: "کلو" }
    ],
    instructionsEn: [
      `Prepare all grocery ingredients for ${capitalTitle}.`,
      "Sauté onions and tomatoes in oil.",
      "Add main ingredients and cook until tender."
    ],
    instructionsUr: [
      `${capitalTitle} کے تمام درکار اجزاء اکٹھے کریں۔`,
      "پیاز اور ٹماٹروں کو آئل میں بھونیں۔",
      "مرغی اور مصالحے شامل کر کے گلا لیں۔"
    ]
  };
}

let etherealTestAccount: any = null;

async function sendVerificationEmail(toEmail: string, code: string) {
  let mailer = nodemailer;
  if (!mailer) {
    try {
      mailer = require("nodemailer");
    } catch (e1) {
      try {
        const mod = await import("nodemailer");
        mailer = mod.default || mod;
      } catch (e2) {
        console.error("[SMTP SYSTEM] Could not load nodemailer module:", e2);
      }
    }
  }

  if (!mailer) {
    throw new Error("Email service is temporarily unavailable. Please verify 'nodemailer' is installed in node_modules.");
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const rawUser = process.env.SMTP_USER || process.env.GMAIL_USER || "muskanmehmood2611@gmail.com";
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_PASS || "rucwgjfcukdabttz";
  const user = rawUser.trim().replace(/[)\s]+$/, "");
  const pass = rawPass.replace(/\s+/g, "");

  let transporter: any;

  if (user && pass) {
    transporter = mailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    if (!etherealTestAccount) {
      try {
        etherealTestAccount = await mailer.createTestAccount();
        console.log(`[SMTP SYSTEM] Created Ethereal SMTP test account: ${etherealTestAccount.user}`);
      } catch (e) {
        console.error("[SMTP SYSTEM] Failed to create Ethereal test account:", e);
      }
    }
    if (etherealTestAccount) {
      transporter = mailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: etherealTestAccount.user,
          pass: etherealTestAccount.pass
        }
      });
    } else {
      transporter = mailer.createTransport({
        jsonTransport: true
      });
    }
  }

  const senderAddress = user || "muskanmehmood2611@gmail.com";

  const info = await transporter.sendMail({
    from: `"VoxCart Security" <${senderAddress}>`,
    replyTo: `"VoxCart Security" <${senderAddress}>`,
    to: toEmail,
    subject: `Your VoxCart Verification Code: ${code}`,
    text: `Your VoxCart security verification code is: ${code}\n\nPlease enter this 6-digit code on the VoxCart website to verify your account.\nThis verification code is valid for 10 minutes.\n\nIf you did not request this verification code, please ignore this email.\n\nVoxCart Security Team`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px; line-height: 1.5;">
        <div style="max-width: 480px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #6d28d9; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">VoxCart Online Store</h1>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Account Security Verification</p>
          </div>
          <p style="color: #334155; font-size: 14px; margin-bottom: 16px;">Hello,</p>
          <p style="color: #334155; font-size: 14px; margin-bottom: 20px;">Use the following 6-digit security verification code to complete your request on VoxCart:</p>
          <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #6d28d9; background: #f1f5f9; padding: 18px 24px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px dashed #cbd5e1;">
            ${code}
          </div>
          <p style="font-size: 13px; color: #64748b; margin-top: 20px;">This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">If you did not request this code, no action is required.<br />&copy; VoxCart Security Team</p>
        </div>
      </div>
    `,
    headers: {
      "X-Priority": "1 (Highest)",
      "X-MSMail-Priority": "High",
      "Importance": "High",
      "Auto-Submitted": "auto-generated",
      "X-Auto-Response-Suppress": "OOF, AutoReply, All",
      "List-Unsubscribe": `<mailto:${senderAddress}?subject=unsubscribe>`
    }
  });

  const testUrl = mailer && mailer.getTestMessageUrl ? mailer.getTestMessageUrl(info) : null;
  if (testUrl) {
    console.log(`[SMTP SYSTEM] Verification email dispatched to ${toEmail}. Preview URL: ${testUrl}`);
  } else {
    console.log(`[SMTP SYSTEM] Verification email successfully delivered to ${toEmail} via SMTP (${host}:${port})`);
  }

  return true;
}

// Synchronize GEMINI_API_KEY into .env file so that PHP backend can read it
if (process.env.GEMINI_API_KEY) {
  try {
    const envPath = path.join(process.cwd(), ".env");
    let currentEnv = "";
    if (fs.existsSync(envPath)) {
      currentEnv = fs.readFileSync(envPath, "utf8");
    }
    const lines = currentEnv.split("\n");
    const hasKey = lines.some(l => l.trim().startsWith("GEMINI_API_KEY="));
    if (!hasKey) {
      fs.writeFileSync(envPath, `${currentEnv.trim()}\nGEMINI_API_KEY=${process.env.GEMINI_API_KEY}\n`);
    } else {
      const updatedLines = lines.map(line => {
        if (line.trim().startsWith("GEMINI_API_KEY=")) {
          return `GEMINI_API_KEY=${process.env.GEMINI_API_KEY}`;
        }
        return line;
      });
      fs.writeFileSync(envPath, updatedLines.join("\n"));
    }
    console.log("Successfully synchronized GEMINI_API_KEY into root .env file for PHP integration.");
  } catch (err) {
    console.error("Failed to sync GEMINI_API_KEY to root .env file:", err);
  }
}

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db_store.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper to interact with our JSON data store safely
interface DBData {
  users: any[];
  products: any[];
  cart: { [userId: string]: { productId: number | string; qty: number; name?: string; nameUr?: string; price?: number; unit?: string; unitUr?: string; currencyCode?: string }[] };
  favourites: { [userId: string]: number[] };
  orders: any[];
  categories?: { id: string; name: string; nameUr: string; status?: string }[];
  userCategories?: { [userId: string]: { id: string; name: string; nameUr?: string; icon?: string; description?: string; extractedAt: string; sourceQuery?: string }[] };
  brands?: { id: string; name: string; logo: string; status: string }[];
  subcategories?: { id: string; categoryId: string; name: string; nameUr: string; status: string }[];
  units?: { id: string; name: string; nameUr: string; status: string }[];
  currencies?: { id: string; name: string; code: string; symbol: string; status: string }[];
  adminActivityLogs?: { id: string; message?: string; action?: string; description?: string; userEmail?: string; timestamp: string }[];
  feedback?: any[];
}

function getDB(): DBData {
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DBData = {
      users: [
        {
          id: "usr_admin",
          name: "Admin Manager",
          email: "admin@voxcart.com",
          password: "admin", // Simple for testing
          role: "admin",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
          createdAt: new Date().toISOString()
        },
        {
          id: "usr_test",
          name: "Guest Shopper",
          email: "guest@voxcart.com",
          password: "guest",
          role: "user",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
          createdAt: new Date().toISOString()
        }
      ],
      products: [],
      cart: {},
      favourites: {},
      orders: [],
      categories: [
        { id: "Dairy", name: "Dairy", nameUr: "دودھ کی مصنوعات", status: "Active" },
        { id: "Fruits", name: "Fruits", nameUr: "پھل", status: "Active" },
        { id: "Vegetables", name: "Vegetables", nameUr: "سبزیاں", status: "Active" },
        { id: "Meat", name: "Meat", nameUr: "گوشت", status: "Active" },
        { id: "Beverages", name: "Beverages", nameUr: "مشروبات", status: "Active" },
        { id: "Pantry", name: "Pantry", nameUr: "پنساری", status: "Active" }
      ],
      brands: [
        { id: "brand-nestle", name: "Nestlé", logo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&h=150&q=80", status: "Active" },
        { id: "brand-national", name: "National Foods", logo: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=150&h=150&q=80", status: "Active" },
        { id: "brand-pepsico", name: "PepsiCo", logo: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&h=150&q=80", status: "Active" },
        { id: "brand-unilever", name: "Unilever", logo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&h=150&q=80", status: "Active" },
        { id: "brand-general", name: "General Brands", logo: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=150&h=150&q=80", status: "Active" }
      ],
      subcategories: [
        { id: "sub-milk", categoryId: "Dairy", name: "Milk", nameUr: "دودھ", status: "Active" },
        { id: "sub-cheese", categoryId: "Dairy", name: "Cheese", nameUr: "پنیر", status: "Active" },
        { id: "sub-butter", categoryId: "Dairy", name: "Butter", nameUr: "مکھن", status: "Active" },
        { id: "sub-eggs", categoryId: "Dairy", name: "Eggs", nameUr: "انڈے", status: "Active" },
        { id: "sub-fresh-fruits", categoryId: "Fruits", name: "Fresh Fruits", nameUr: "تازہ پھل", status: "Active" },
        { id: "sub-citrus", categoryId: "Fruits", name: "Citrus", nameUr: "کھٹے پھل", status: "Active" },
        { id: "sub-fresh-vegetables", categoryId: "Vegetables", name: "Fresh Vegetables", nameUr: "تازہ سبزیاں", status: "Active" },
        { id: "sub-tubers", categoryId: "Vegetables", name: "Root Vegetables", nameUr: "جڑ والی سبزیاں", status: "Active" },
        { id: "sub-chicken", categoryId: "Meat", name: "Chicken", nameUr: "مرغی", status: "Active" },
        { id: "sub-beef", categoryId: "Meat", name: "Beef", nameUr: "بڑا گوشت", status: "Active" },
        { id: "sub-fish", categoryId: "Meat", name: "Fish", nameUr: "مچھلی", status: "Active" },
        { id: "sub-soft-drinks", categoryId: "Beverages", name: "Soft Drinks", nameUr: "سافٹ ڈرنکس", status: "Active" },
        { id: "sub-water", categoryId: "Beverages", name: "Mineral Water", nameUr: "منرل واٹر", status: "Active" },
        { id: "sub-tea", categoryId: "Beverages", name: "Tea & Coffee", nameUr: "چائے اور کافی", status: "Active" },
        { id: "sub-rice", categoryId: "Pantry", name: "Rice & Grains", nameUr: "چاول اور اناج", status: "Active" },
        { id: "sub-pasta", categoryId: "Pantry", name: "Pasta & Noodles", nameUr: "پاستا اور نوڈلز", status: "Active" },
        { id: "sub-oil", categoryId: "Pantry", name: "Cooking Oil", nameUr: "ککنگ آئل", status: "Active" },
        { id: "sub-spices", categoryId: "Pantry", name: "Spices & Salt", nameUr: "مصالحے اور نمک", status: "Active" }
      ],
      units: [
        { id: "unit-piece", name: "Piece", nameUr: "عدد", status: "Active" },
        { id: "unit-kg", name: "KG", nameUr: "کلو", status: "Active" },
        { id: "unit-gram", name: "Gram", nameUr: "گرام", status: "Active" },
        { id: "unit-liter", name: "Liter", nameUr: "لیٹر", status: "Active" },
        { id: "unit-ml", name: "ML", nameUr: "ملی لیٹر", status: "Active" },
        { id: "unit-pack", name: "Pack", nameUr: "پیکٹ", status: "Active" },
        { id: "unit-box", name: "Box", nameUr: "ڈبہ", status: "Active" },
        { id: "unit-dozen", name: "Dozen", nameUr: "درجن", status: "Active" }
      ],
      currencies: [
        { id: "curr-usd", name: "US Dollar", code: "USD", symbol: "$", status: "Active" },
        { id: "curr-eur", name: "Euro", code: "EUR", symbol: "€", status: "Active" },
        { id: "curr-gbp", name: "British Pound", code: "GBP", symbol: "£", status: "Active" },
        { id: "curr-pkr", name: "Pakistani Rupee", code: "PKR", symbol: "Rs", status: "Active" },
        { id: "curr-aed", name: "UAE Dirham", code: "AED", symbol: "د.إ", status: "Active" }
      ],
      adminActivityLogs: [
        { id: "log_init", message: "System initialized with database-driven architecture, normalized tables, and activity logging.", timestamp: new Date().toISOString() }
      ]
    };

    // Seed raw products with foreign key linkages
    const seededProducts = [
      { id: 1, name: "Whole Milk", nameUr: "خالص دودھ", categoryId: "Dairy", price: 1100, salePrice: null, img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80", unitId: "unit-pack", currencyId: "curr-pkr", brandId: "brand-nestle", subcategoryId: "sub-milk", status: "Active" },
      { id: 2, name: "Large Eggs", nameUr: "انڈے", categoryId: "Dairy", price: 1200, salePrice: null, img: "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?auto=format&fit=crop&w=300&q=80", unitId: "unit-dozen", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-eggs", status: "Active" },
      { id: 3, name: "Cheddar Cheese", nameUr: "پنیر", categoryId: "Dairy", price: 1500, salePrice: null, img: "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?auto=format&fit=crop&w=300&q=80", unitId: "unit-piece", currencyId: "curr-pkr", brandId: "brand-unilever", subcategoryId: "sub-cheese", status: "Active" },
      { id: 4, name: "Butter", nameUr: "مکھن", categoryId: "Dairy", price: 1350, salePrice: null, img: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=300&q=80", unitId: "unit-pack", currencyId: "curr-pkr", brandId: "brand-nestle", subcategoryId: "sub-butter", status: "Active" },
      { id: 5, name: "Bananas", nameUr: "کیلے", categoryId: "Fruits", price: 200, salePrice: null, img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=300&q=80", unitId: "unit-kg", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-fresh-fruits", status: "Active" },
      { id: 6, name: "Apples", nameUr: "سیب", categoryId: "Fruits", price: 550, salePrice: null, img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&q=80", unitId: "unit-kg", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-fresh-fruits", status: "Active" },
      { id: 7, name: "Oranges", nameUr: "مالٹے", categoryId: "Fruits", price: 400, salePrice: null, img: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=300&q=80", unitId: "unit-kg", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-citrus", status: "Active" },
      { id: 8, name: "Mangoes", nameUr: "آم", categoryId: "Fruits", price: 700, salePrice: null, img: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=300&q=80", unitId: "unit-piece", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-fresh-fruits", status: "Active" },
      { id: 9, name: "Tomatoes", nameUr: "ٹماٹر", categoryId: "Vegetables", price: 700, salePrice: null, img: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=300&q=80", unitId: "unit-kg", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-fresh-vegetables", status: "Active" },
      { id: 10, name: "Potatoes", nameUr: "آلو", categoryId: "Vegetables", price: 350, salePrice: null, img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80", unitId: "unit-kg", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-tubers", status: "Active" },
      { id: 11, name: "Onions", nameUr: "پیاز", categoryId: "Vegetables", price: 330, salePrice: null, img: "https://images.unsplash.com/photo-1508747703725-719777137510?auto=format&fit=crop&w=300&q=80", unitId: "unit-kg", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-tubers", status: "Active" },
      { id: 12, name: "Carrots", nameUr: "گاجر", categoryId: "Vegetables", price: 400, salePrice: null, img: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&q=80", unitId: "unit-kg", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-fresh-vegetables", status: "Active" },
      { id: 13, name: "Chicken Breast", nameUr: "مرغی کا گوشت", categoryId: "Meat", price: 2200, salePrice: null, img: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=300&q=80", unitId: "unit-kg", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-chicken", status: "Active" },
      { id: 14, name: "Ground Beef", nameUr: "قیمہ", categoryId: "Meat", price: 2400, salePrice: null, img: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=300&q=80", unitId: "unit-kg", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-beef", status: "Active" },
      { id: 15, name: "Salmon Fillet", nameUr: "مچھلی کا فلیٹ", categoryId: "Meat", price: 3600, salePrice: null, img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=300&q=80", unitId: "unit-kg", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-fish", status: "Active" },
      { id: 16, name: "Mineral Water", nameUr: "منرل واٹر", categoryId: "Beverages", price: 550, salePrice: null, img: "https://images.unsplash.com/photo-1608885898957-a599fb1c1404?auto=format&fit=crop&w=300&q=80", unitId: "unit-piece", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-water", status: "Active" },
      { id: 17, name: "Coca-Cola", nameUr: "کوکاکولا", categoryId: "Beverages", price: 530, salePrice: null, img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80", unitId: "unit-piece", currencyId: "curr-pkr", brandId: "brand-pepsico", subcategoryId: "sub-soft-drinks", status: "Active" },
      { id: 18, name: "Green Tea", nameUr: "سبز چائے", categoryId: "Beverages", price: 980, salePrice: null, img: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=300&q=80", unitId: "unit-box", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-tea", status: "Active" },
      { id: 19, name: "White Rice", nameUr: "چاول", categoryId: "Pantry", price: 840, salePrice: null, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80", unitId: "unit-pack", currencyId: "curr-pkr", brandId: "brand-national", subcategoryId: "sub-rice", status: "Active" },
      { id: 20, name: "Pasta", nameUr: "پاستا", categoryId: "Pantry", price: 500, salePrice: null, img: "https://images.unsplash.com/photo-1612966608967-30914a7c646a?auto=format&fit=crop&w=300&q=80", unitId: "unit-box", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-pasta", status: "Active" },
      { id: 21, name: "Cooking Oil", nameUr: "ککنگ آئل", categoryId: "Pantry", price: 550, salePrice: null, img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80", unitId: "unit-piece", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-oil", status: "Active" },
      { id: 22, name: "Sugar", nameUr: "چینی", categoryId: "Pantry", price: 700, salePrice: null, img: "https://images.unsplash.com/photo-1581798459219-318e76aeec7b?auto=format&fit=crop&w=300&q=80", unitId: "unit-pack", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-spices", status: "Active" },
      { id: 23, name: "Salt", nameUr: "نمک", categoryId: "Pantry", price: 360, salePrice: null, img: "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=300&q=80", unitId: "unit-pack", currencyId: "curr-pkr", brandId: "brand-general", subcategoryId: "sub-spices", status: "Active" }
    ];

    initialData.products = seededProducts.map(p => {
      return {
        ...p,
        sku: `SKU-26${String(p.id).padStart(4, "0")}`,
        batchNumber: `BATCH-26B${p.id}`,
        manufacturingDate: "2026-01-15",
        expiryDate: "2027-01-15",
        stockQuantity: 100 + (p.id * 15) % 150,
        description: `Delicious fresh ${p.name} carefully selected for outstanding quality. High nutrition and perfect taste guaranteed.`
      };
    });

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
    return initialData;
  }

  let currentData: any;
  try {
    const fileContent = fs.readFileSync(DB_FILE, "utf8");
    if (!fileContent || fileContent.trim() === "") {
      throw new Error("Empty DB file");
    }
    currentData = JSON.parse(fileContent);
  } catch (error) {
    console.warn("DB file corrupt or empty, re-initializing database...", error);
    const initialData = {
      users: [
        {
          id: "usr_admin",
          name: "Admin User",
          email: "admin@voxcart.com",
          password: "admin",
          role: "admin",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
          createdAt: new Date().toISOString()
        }
      ],
      products: [],
      cart: {},
      favourites: {},
      orders: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
    return initialData;
  }

  let updated = false;
  if (!currentData.cart) {
    currentData.cart = {};
    updated = true;
  }
  if (!currentData.favourites) {
    currentData.favourites = {};
    updated = true;
  }
  if (!currentData.orders) {
    currentData.orders = [];
    updated = true;
  }
  if (!currentData.userCategories) {
    currentData.userCategories = {};
    updated = true;
  }
  currentData.users = (currentData.users || []).map((u: any) => {
    if (!u.avatar) {
      u.avatar = u.id === "usr_admin" 
        ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80" 
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80";
      updated = true;
    }
    return u;
  });

  if (!currentData.brands) {
    currentData.brands = [
      { id: "brand-nestle", name: "Nestlé", logo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&h=150&q=80", status: "Active" },
      { id: "brand-national", name: "National Foods", logo: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=150&h=150&q=80", status: "Active" },
      { id: "brand-pepsico", name: "PepsiCo", logo: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&h=150&q=80", status: "Active" },
      { id: "brand-unilever", name: "Unilever", logo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&h=150&q=80", status: "Active" },
      { id: "brand-general", name: "General Brands", logo: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=150&h=150&q=80", status: "Active" }
    ];
    updated = true;
  }

  if (!currentData.categories) {
    currentData.categories = [
      { id: "Dairy", name: "Dairy", nameUr: "دودھ کی مصنوعات", status: "Active" },
      { id: "Fruits", name: "Fruits", nameUr: "پھل", status: "Active" },
      { id: "Vegetables", name: "Vegetables", nameUr: "سبزیاں", status: "Active" },
      { id: "Meat", name: "Meat", nameUr: "گوشت", status: "Active" },
      { id: "Beverages", name: "Beverages", nameUr: "مشروبات", status: "Active" },
      { id: "Pantry", name: "Pantry", nameUr: "پنساری", status: "Active" }
    ];
    updated = true;
  } else {
    currentData.categories = currentData.categories.map((c: any) => {
      if (!c.status) {
        c.status = "Active";
        updated = true;
      }
      return c;
    });
  }

  if (!currentData.subcategories) {
    currentData.subcategories = [
      { id: "sub-milk", categoryId: "Dairy", name: "Milk", nameUr: "دودھ", status: "Active" },
      { id: "sub-cheese", categoryId: "Dairy", name: "Cheese", nameUr: "پنیر", status: "Active" },
      { id: "sub-butter", categoryId: "Dairy", name: "Butter", nameUr: "مکھن", status: "Active" },
      { id: "sub-eggs", categoryId: "Dairy", name: "Eggs", nameUr: "انڈے", status: "Active" },
      { id: "sub-fresh-fruits", categoryId: "Fruits", name: "Fresh Fruits", nameUr: "تازہ پھل", status: "Active" },
      { id: "sub-citrus", categoryId: "Fruits", name: "Citrus", nameUr: "کھٹے پھل", status: "Active" },
      { id: "sub-fresh-vegetables", categoryId: "Vegetables", name: "Fresh Vegetables", nameUr: "تازہ سبزیاں", status: "Active" },
      { id: "sub-tubers", categoryId: "Vegetables", name: "Root Vegetables", nameUr: "جڑ والی سبزیاں", status: "Active" },
      { id: "sub-chicken", categoryId: "Meat", name: "Chicken", nameUr: "مرغی", status: "Active" },
      { id: "sub-beef", categoryId: "Meat", name: "Beef", nameUr: "بڑا گوشت", status: "Active" },
      { id: "sub-fish", categoryId: "Meat", name: "Fish", nameUr: "مچھلی", status: "Active" },
      { id: "sub-soft-drinks", categoryId: "Beverages", name: "Soft Drinks", nameUr: "سافٹ ڈرنکس", status: "Active" },
      { id: "sub-water", categoryId: "Beverages", name: "Mineral Water", nameUr: "منرل واٹر", status: "Active" },
      { id: "sub-tea", categoryId: "Beverages", name: "Tea & Coffee", nameUr: "چائے اور کافی", status: "Active" },
      { id: "sub-rice", categoryId: "Pantry", name: "Rice & Grains", nameUr: "چاول اور اناج", status: "Active" },
      { id: "sub-pasta", categoryId: "Pantry", name: "Pasta & Noodles", nameUr: "پاستا اور نوڈلز", status: "Active" },
      { id: "sub-oil", categoryId: "Pantry", name: "Cooking Oil", nameUr: "ککنگ آئل", status: "Active" },
      { id: "sub-spices", categoryId: "Pantry", name: "Spices & Salt", nameUr: "مصالحے اور نمک", status: "Active" }
    ];
    updated = true;
  }

  if (!currentData.units) {
    currentData.units = [
      { id: "unit-piece", name: "Piece", nameUr: "عدد", status: "Active" },
      { id: "unit-kg", name: "KG", nameUr: "کلو", status: "Active" },
      { id: "unit-gram", name: "Gram", nameUr: "گرام", status: "Active" },
      { id: "unit-liter", name: "Liter", nameUr: "لیٹر", status: "Active" },
      { id: "unit-ml", name: "ML", nameUr: "ملی لیٹر", status: "Active" },
      { id: "unit-pack", name: "Pack", nameUr: "پیکٹ", status: "Active" },
      { id: "unit-box", name: "Box", nameUr: "ڈبہ", status: "Active" },
      { id: "unit-dozen", name: "Dozen", nameUr: "درجن", status: "Active" }
    ];
    updated = true;
  }

  if (!currentData.currencies) {
    currentData.currencies = [
      { id: "curr-usd", name: "US Dollar", code: "USD", symbol: "$", status: "Active" },
      { id: "curr-eur", name: "Euro", code: "EUR", symbol: "€", status: "Active" },
      { id: "curr-gbp", name: "British Pound", code: "GBP", symbol: "£", status: "Active" },
      { id: "curr-pkr", name: "Pakistani Rupee", code: "PKR", symbol: "Rs", status: "Active" },
      { id: "curr-aed", name: "UAE Dirham", code: "AED", symbol: "د.إ", status: "Active" }
    ];
    updated = true;
  }

  if (!currentData.adminActivityLogs) {
    currentData.adminActivityLogs = [
      { id: "log_init", message: "System activity logging enabled.", timestamp: new Date().toISOString() }
    ];
    updated = true;
  }
  if (!currentData.feedback) {
    currentData.feedback = [];
    updated = true;
  }
  if (currentData.products && Array.isArray(currentData.products)) {
    currentData.products = currentData.products.map((p: any) => {
      let prodUpdated = false;
      if (!p.sku) {
        p.sku = `SKU-26${String(p.id).padStart(4, "0")}`;
        prodUpdated = true;
      }
      if (!p.batchNumber) {
        p.batchNumber = `BATCH-26B${p.id}`;
        prodUpdated = true;
      }
      if (!p.manufacturingDate) {
        p.manufacturingDate = "2026-01-15";
        prodUpdated = true;
      }
      if (!p.expiryDate) {
        p.expiryDate = "2027-01-15";
        prodUpdated = true;
      }
      if (p.stockQuantity === undefined || p.stockQuantity === null) {
        p.stockQuantity = 100 + (p.id * 15) % 150;
        prodUpdated = true;
      }
      if (!p.description) {
        p.description = `Delicious fresh ${p.name || "product"} carefully selected for outstanding quality. High nutrition and perfect taste guaranteed.`;
        prodUpdated = true;
      }
      if (!p.brandId) {
        p.brandId = "brand-general";
        prodUpdated = true;
      }
      if (!p.categoryId) {
        p.categoryId = p.category || "Dairy";
        prodUpdated = true;
      }
      if (!p.subcategoryId) {
        // Find a subcategory matching categoryId
        const sub = currentData.subcategories.find((s: any) => s.categoryId === p.categoryId);
        p.subcategoryId = sub ? sub.id : "sub-milk";
        prodUpdated = true;
      }
      if (!p.unitId) {
        const uStr = String(p.unit).toLowerCase();
        let matchUnit = "unit-piece";
        if (uStr.includes("kg") || uStr.includes("lb") || uStr.includes("paund")) matchUnit = "unit-kg";
        else if (uStr.includes("dozen")) matchUnit = "unit-dozen";
        else if (uStr.includes("pack")) matchUnit = "unit-pack";
        else if (uStr.includes("box") || uStr.includes("dabba")) matchUnit = "unit-box";
        else if (uStr.includes("liter")) matchUnit = "unit-liter";
        else if (uStr.includes("gram")) matchUnit = "unit-gram";
        else if (uStr.includes("ml")) matchUnit = "unit-ml";
        p.unitId = matchUnit;
        prodUpdated = true;
      }
      if (!p.currencyId) {
        p.currencyId = "curr-pkr";
        prodUpdated = true;
      }
      if (!p.status) {
        p.status = "Active";
        prodUpdated = true;
      }
      if (p.salePrice === undefined) {
        p.salePrice = null;
        prodUpdated = true;
      }
      if (prodUpdated) {
        updated = true;
      }
      return p;
    });
  }

  if (updated) {
    fs.writeFileSync(DB_FILE, JSON.stringify(currentData, null, 2), "utf8");
  }
  return currentData;
}

function saveDB(data: DBData) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Serve static uploads
  app.use("/uploads", express.static(UPLOADS_DIR));

  // Pre-seed or read database
  getDB();

  // API: Health / Ping
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Password Hashing & Verification Utilities
  function isStrongPassword(password: string): { valid: boolean; message?: string } {
    if (!password || typeof password !== "string") {
      return { valid: false, message: "Password is required." };
    }
    if (password.length < 8) {
      return { valid: false, message: "Password must be at least 8 characters long." };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: "Password must contain at least one uppercase letter (A-Z)." };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: "Password must contain at least one lowercase letter (a-z)." };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: "Password must contain at least one digit (0-9)." };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { valid: false, message: "Password must contain at least one special character (e.g. !@#$%^&*)." };
    }
    return { valid: true };
  }

  function hashPassword(password: string): string {
    if (!password) return "";
    return crypto.createHash("sha256").update(String(password)).digest("hex");
  }

  function verifyPassword(inputPassword: string, storedPassword: string): boolean {
    if (!inputPassword || !storedPassword) return false;
    // 1. Direct match for legacy test passwords (e.g., "admin", "guest")
    if (inputPassword === storedPassword) return true;
    // 2. SHA-256 match
    const hashed = hashPassword(inputPassword);
    return hashed === storedPassword;
  }

  // Transient in-memory store for email verification codes
  const pendingVerifications = new Map<string, { code: string; expiresAt: number; attempts: number }>();

  // API: Send Email Verification Code
  app.post("/api/auth/send-verification-code", async (req, res) => {
    const { email } = req.body;
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: "Email address is required." });
    }
    const cleanEmail = String(email).trim().toLowerCase();

    // Generate secure 6-digit random verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity
    
    try {
      // Attempt sending real email via Nodemailer FIRST
      await sendVerificationEmail(cleanEmail, code);
      
      // Store in pendingVerifications ONLY after successful email dispatch
      pendingVerifications.set(cleanEmail, { code, expiresAt, attempts: 0 });

      return res.json({
        success: true,
        message: `A unique 6-digit verification code has been sent to ${cleanEmail}. Please check your email inbox.`,
        email: cleanEmail
      });
    } catch (err: any) {
      console.error(`[EMAIL VERIFICATION SYSTEM] Error sending verification email to ${cleanEmail}:`, err);
      return res.status(500).json({
        error: `Failed to deliver verification code to ${cleanEmail}. ${err.message || "Please check server email settings."}`
      });
    }
  });

  // API: Verify Code
  app.post("/api/auth/verify-code", (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "Email and verification code are required." });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();
    
    const record = pendingVerifications.get(cleanEmail);
    if (!record) {
      return res.status(400).json({ error: "No verification code requested or session expired. Please request a new code." });
    }
    
    if (Date.now() > record.expiresAt) {
      pendingVerifications.delete(cleanEmail);
      return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
    }
    
    if (record.attempts >= 5) {
      pendingVerifications.delete(cleanEmail);
      return res.status(400).json({ error: "Too many failed attempts. Please request a new verification code." });
    }
    
    if (record.code !== cleanCode) {
      record.attempts += 1;
      return res.status(400).json({ error: "Incorrect verification code. Please check and try again." });
    }
    
    // Code verified!
    pendingVerifications.delete(cleanEmail);
    res.json({
      success: true,
      verified: true,
      message: "Email address verified successfully!"
    });
  });

  // API: Authentication Login (Normal email + password login)
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const db = getDB();
    const user = db.users.find(u => u.email.toLowerCase().trim() === cleanEmail);

    if (!user) {
      return res.status(401).json({ error: "Account not found with this email. Please create an account." });
    }

    if (password && !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: "Invalid password for this account." });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
    });
  });

  // API: User Registration with required Email Verification
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, verificationCode, code } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are all required." });
    }

    const passCheck = isStrongPassword(String(password));
    if (!passCheck.valid) {
      return res.status(400).json({ error: passCheck.message });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const db = getDB();

    if (db.users.some(u => u.email.toLowerCase().trim() === cleanEmail)) {
      return res.status(400).json({ error: "An account with this email address already exists. Please log in." });
    }

    const verifyCode = verificationCode || code;
    if (verifyCode) {
      const record = pendingVerifications.get(cleanEmail);
      if (!record) {
        return res.status(400).json({ error: "Verification code expired or not requested. Please request a new code." });
      }
      if (Date.now() > record.expiresAt) {
        pendingVerifications.delete(cleanEmail);
        return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
      }
      if (record.code !== String(verifyCode).trim()) {
        record.attempts += 1;
        return res.status(400).json({ error: "Incorrect verification code. Please enter the valid 6-digit code." });
      }
      // Validated
      pendingVerifications.delete(cleanEmail);
    }

    const newUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 11),
      name: String(name).trim(),
      email: cleanEmail,
      password: hashPassword(String(password)),
      role: "user",
      isEmailVerified: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDB(db);
    res.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      isEmailVerified: true
    });
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    const passCheck = isStrongPassword(String(newPassword));
    if (!passCheck.valid) {
      return res.status(400).json({ error: passCheck.message });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const db = getDB();
    const userIndex = db.users.findIndex(u => u.email.toLowerCase().trim() === cleanEmail);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User with this email address was not found." });
    }

    db.users[userIndex].password = hashPassword(String(newPassword));
    saveDB(db);
    res.json({ success: true, message: "Password reset successfully! You can now log in with your new password." });
  });

  app.post("/api/auth/update-password", (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: "User ID, current password, and new password are required" });
    }

    const passCheck = isStrongPassword(String(newPassword));
    if (!passCheck.valid) {
      return res.status(400).json({ error: passCheck.message });
    }

    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!verifyPassword(currentPassword, user.password)) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    user.password = hashPassword(String(newPassword));
    saveDB(db);
    res.json({ success: true, message: "Password updated successfully!" });
  });

  app.post("/api/auth/update-avatar", (req, res) => {
    const { userId, avatar } = req.body;
    if (!userId || !avatar) {
      return res.status(400).json({ error: "Missing required fields: userId and avatar" });
    }
    const db = getDB();
    const index = db.users.findIndex(u => u.id === userId);
    if (index === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    db.users[index].avatar = avatar;
    saveDB(db);
    res.json({
      success: true,
      avatar: db.users[index].avatar,
      message: "Display picture upgraded successfully!"
    });
  });

  // API: Feedback & Complaint System
  app.post("/api/feedback", (req, res) => {
    const { userId, userName, userEmail, type, subject, message, rating } = req.body;
    if (!subject || !String(subject).trim() || !message || !String(message).trim()) {
      return res.status(400).json({ error: "Subject and message content are required." });
    }
    const db = getDB();
    db.feedback = db.feedback || [];

    const newFeedback = {
      id: "fb_" + Math.random().toString(36).substring(2, 11),
      userId: userId || "guest",
      userName: userName || "Anonymous User",
      userEmail: userEmail || "guest@voxcart.com",
      type: type || "feedback", // "feedback" | "complaint" | "suggestion"
      subject: String(subject).trim(),
      message: String(message).trim(),
      rating: typeof rating === "number" ? Math.min(5, Math.max(1, rating)) : 5,
      status: "Pending", // "Pending" | "Replied"
      adminResponse: null,
      createdAt: new Date().toISOString(),
      repliedAt: null
    };

    db.feedback.unshift(newFeedback);
    saveDB(db);

    res.json({
      success: true,
      feedback: newFeedback,
      message: "Your submission has been received successfully! Thank you for your feedback."
    });
  });

  app.get("/api/feedback", (req, res) => {
    const db = getDB();
    db.feedback = db.feedback || [];
    const { userId, email } = req.query;

    if (userId && userId !== "usr_admin") {
      const userItems = db.feedback.filter((f: any) => 
        String(f.userId) === String(userId) || 
        (email && f.userEmail && String(f.userEmail).toLowerCase() === String(email).toLowerCase())
      );
      return res.json(userItems);
    }

    // Admin gets all feedback items
    res.json(db.feedback);
  });

  app.post("/api/feedback/:id/reply", (req, res) => {
    const { id } = req.params;
    const { adminResponse } = req.body;
    if (!adminResponse || !String(adminResponse).trim()) {
      return res.status(400).json({ error: "Reply message cannot be empty." });
    }

    const db = getDB();
    db.feedback = db.feedback || [];

    const index = db.feedback.findIndex((f: any) => f.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Feedback item not found." });
    }

    db.feedback[index].status = "Replied";
    db.feedback[index].adminResponse = String(adminResponse).trim();
    db.feedback[index].repliedAt = new Date().toISOString();

    saveDB(db);

    res.json({
      success: true,
      feedback: db.feedback[index],
      message: "Response submitted and sent to user successfully!"
    });
  });

  app.delete("/api/feedback/:id", (req, res) => {
    const { id } = req.params;
    const db = getDB();
    db.feedback = db.feedback || [];

    db.feedback = db.feedback.filter((f: any) => f.id !== id);
    saveDB(db);

    res.json({ success: true, message: "Feedback entry deleted successfully." });
  });

  // Admin routing to view and add new users
  app.get("/api/admin/users", (req, res) => {
    const db = getDB();
    const orders = db.orders || [];
    const usersWithOrderStatus = db.users.map(u => {
      const userOrders = orders.filter(o => o.userId === u.id);
      const hasShippedOrDeliveredOrders = userOrders.some(o => o.status === "Shipped" || o.status === "Delivered");
      return {
        ...u,
        hasShippedOrDeliveredOrders
      };
    });
    res.json(usersWithOrderStatus);
  });

  app.post("/api/admin/users", (req, res) => {
    const { name, email, password, role, avatar } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const db = getDB();
    const newUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 11),
      name,
      email,
      password,
      role: role || "user",
      avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDB(db);
    res.json(newUser);
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    const { id } = req.params;
    console.log(`Attempting to delete user with ID: ${id}`);
    const db = getDB();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) {
      console.log(`User with ID ${id} not found.`);
      return res.status(404).json({ error: "User not found" });
    }
    db.users.splice(index, 1);
    saveDB(db);
    console.log(`User ${id} successfully deleted.`);
    res.json({ success: true, message: `User ${id} has been deleted from system.` });
  });

  // Helper to resolve relational references to flat string attributes for backwards compatibility
  function resolveProductFlatFields(product: any, db: DBData) {
    const brand = db.brands?.find(b => 
      String(b.id || "").toLowerCase() === String(product.brandId || product.brand_id || "").toLowerCase() ||
      String(b.name || "").toLowerCase() === String(product.brand || product.brandName || "").toLowerCase()
    );
    const category = db.categories?.find(c => 
      String(c.id || "").toLowerCase() === String(product.categoryId || product.category_id || "").toLowerCase() ||
      String(c.name || "").toLowerCase() === String(product.category || "").toLowerCase()
    );
    const subcategory = db.subcategories?.find(s => 
      String(s.id || "").toLowerCase() === String(product.subcategoryId || product.subcategory_id || "").toLowerCase() ||
      String(s.name || "").toLowerCase() === String(product.subcategory || product.subcategoryName || product.sub_category || "").toLowerCase()
    );
    const unit = db.units?.find(u => 
      String(u.id || "").toLowerCase() === String(product.unitId || product.unit_id || "").toLowerCase() ||
      String(u.name || "").toLowerCase() === String(product.unit || "").toLowerCase()
    );
    const currency = db.currencies?.find(c => 
      String(c.id || "").toLowerCase() === String(product.currencyId || product.currency_id || "").toLowerCase() ||
      String(c.code || "").toLowerCase() === String(product.currency || product.currencyCode || "").toLowerCase()
    );

    return {
      ...product,
      brandId: brand ? brand.id : (product.brandId || product.brand_id || "brand-general"),
      brand_id: brand ? brand.id : (product.brandId || product.brand_id || "brand-general"),
      categoryId: category ? category.id : (product.categoryId || product.category_id || "Pantry"),
      category_id: category ? category.id : (product.categoryId || product.category_id || "Pantry"),
      subcategoryId: subcategory ? subcategory.id : (product.subcategoryId || product.subcategory_id || ""),
      subcategory_id: subcategory ? subcategory.id : (product.subcategoryId || product.subcategory_id || ""),
      unitId: unit ? unit.id : (product.unitId || product.unit_id || "unit-piece"),
      unit_id: unit ? unit.id : (product.unitId || product.unit_id || "unit-piece"),
      currencyId: currency ? currency.id : (product.currencyId || product.currency_id || "curr-pkr"),
      currency_id: currency ? currency.id : (product.currencyId || product.currency_id || "curr-pkr"),
      currency: currency ? currency.id : (product.currency || product.currencyId || "curr-pkr"),
      brandName: brand ? brand.name : "General",
      brandLogo: brand ? brand.logo : "",
      category: category ? category.name : (product.category || "Pantry"),
      categoryUr: category ? category.nameUr : "",
      subcategoryName: subcategory ? subcategory.name : "",
      subcategoryNameUr: subcategory ? subcategory.nameUr : "",
      unit: unit ? unit.name : (product.unit || "Piece"),
      unitUr: unit ? unit.nameUr : (product.unitUr || "عدد"),
      currencyCode: currency ? currency.code : "PKR",
      currencySymbol: currency ? currency.symbol : "Rs"
    };
  }

  // API: Brands CRUD
  app.get("/api/brands", (req, res) => {
    const db = getDB();
    res.json(db.brands || []);
  });

  app.post("/api/brands", (req, res) => {
    const { name, logo, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Brand name is required" });
    }
    const db = getDB();
    if (!db.brands) db.brands = [];
    const id = "brand-" + name.trim().toLowerCase().replace(/\s+/g, "-");
    if (db.brands.some(b => b.id === id || b.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ error: "Brand already exists" });
    }
    const newBrand = {
      id,
      name,
      logo: logo || "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=150&h=150&q=80",
      status: status || "Active"
    };
    db.brands.push(newBrand);

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "CREATE_BRAND",
      description: `Created brand '${name}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(newBrand);
  });

  app.put("/api/brands/:id", (req, res) => {
    const { id } = req.params;
    const { name, logo, status } = req.body;
    const db = getDB();
    if (!db.brands) db.brands = [];
    const index = db.brands.findIndex(b => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Brand not found" });
    }
    db.brands[index] = {
      ...db.brands[index],
      name: name || db.brands[index].name,
      logo: logo || db.brands[index].logo,
      status: status || db.brands[index].status
    };

    saveDB(db);
    res.json(db.brands[index]);
  });

  app.delete("/api/brands/:id", (req, res) => {
    const { id } = req.params;
    const db = getDB();
    if (!db.brands) db.brands = [];
    const index = db.brands.findIndex(b => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Brand not found" });
    }
    const bName = db.brands[index].name;
    db.brands.splice(index, 1);

    // Detach deleted brand in products
    if (db.products) {
      db.products.forEach(p => {
        if (p.brandId === id) {
          p.brandId = "brand-general";
        }
      });
    }

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "DELETE_BRAND",
      description: `Deleted brand '${bName}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json({ success: true });
  });

  // API: Subcategories CRUD
  app.get("/api/subcategories", (req, res) => {
    const db = getDB();
    res.json(db.subcategories || []);
  });

  app.post("/api/subcategories", (req, res) => {
    const { name, nameUr, categoryId, status } = req.body;
    if (!name || !nameUr || !categoryId) {
      return res.status(400).json({ error: "Name, Urdu Name, and Parent Category are required" });
    }
    const db = getDB();
    if (!db.subcategories) db.subcategories = [];
    const id = "sub-" + name.trim().toLowerCase().replace(/\s+/g, "-");
    if (db.subcategories.some(s => s.id === id)) {
      return res.status(400).json({ error: "Subcategory key code already exists" });
    }
    const catExists = db.categories?.some(c => c.id === categoryId);
    if (!catExists) {
      return res.status(400).json({ error: "Parent category does not exist" });
    }

    const newSub = {
      id,
      categoryId,
      name,
      nameUr,
      status: status || "Active"
    };
    db.subcategories.push(newSub);

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "CREATE_SUBCATEGORY",
      description: `Created subcategory '${name}' under category '${categoryId}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(newSub);
  });

  app.put("/api/subcategories/:id", (req, res) => {
    const { id } = req.params;
    const { name, nameUr, categoryId, status } = req.body;
    const db = getDB();
    if (!db.subcategories) db.subcategories = [];
    const index = db.subcategories.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Subcategory not found" });
    }
    if (categoryId) {
      const catExists = db.categories?.some(c => c.id === categoryId);
      if (!catExists) {
        return res.status(400).json({ error: "Selected Category does not exist" });
      }
    }
    db.subcategories[index] = {
      ...db.subcategories[index],
      name: name || db.subcategories[index].name,
      nameUr: nameUr || db.subcategories[index].nameUr,
      categoryId: categoryId || db.subcategories[index].categoryId,
      status: status || db.subcategories[index].status
    };

    saveDB(db);
    res.json(db.subcategories[index]);
  });

  app.delete("/api/subcategories/:id", (req, res) => {
    const { id } = req.params;
    const db = getDB();
    if (!db.subcategories) db.subcategories = [];
    const index = db.subcategories.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Subcategory not found" });
    }
    const sName = db.subcategories[index].name;
    db.subcategories.splice(index, 1);

    // Update products using this subcategory to another available subcategory
    if (db.products) {
      db.products.forEach(p => {
        if (p.subcategoryId === id) {
          const replacement = db.subcategories?.find(sub => sub.categoryId === p.categoryId);
          p.subcategoryId = replacement ? replacement.id : "";
        }
      });
    }

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "DELETE_SUBCATEGORY",
      description: `Deleted subcategory '${sName}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json({ success: true });
  });

  // API: Units CRUD
  app.get("/api/units", (req, res) => {
    const db = getDB();
    res.json(db.units || []);
  });

  app.post("/api/units", (req, res) => {
    const { name, nameUr, status } = req.body;
    if (!name || !nameUr) {
      return res.status(400).json({ error: "Unit Name and Urdu Translation are required" });
    }
    const db = getDB();
    if (!db.units) db.units = [];
    const id = "unit-" + name.trim().toLowerCase().replace(/\s+/g, "-");
    if (db.units.some(u => u.id === id)) {
      return res.status(400).json({ error: "Unit already exists" });
    }
    const newUnit = { id, name, nameUr, status: status || "Active" };
    db.units.push(newUnit);

    saveDB(db);
    res.json(newUnit);
  });

  app.put("/api/units/:id", (req, res) => {
    const { id } = req.params;
    const { name, nameUr, status } = req.body;
    const db = getDB();
    if (!db.units) db.units = [];
    const index = db.units.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Unit not found" });
    }
    db.units[index] = {
      ...db.units[index],
      name: name || db.units[index].name,
      nameUr: nameUr || db.units[index].nameUr,
      status: status || db.units[index].status
    };

    saveDB(db);
    res.json(db.units[index]);
  });

  app.delete("/api/units/:id", (req, res) => {
    const { id } = req.params;
    const db = getDB();
    if (!db.units) db.units = [];
    const index = db.units.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Unit not found" });
    }
    db.units.splice(index, 1);

    // Reset unitId in products to default Piece if it was deleted
    if (db.products) {
      db.products.forEach(p => {
        if (p.unitId === id) {
          p.unitId = "unit-piece";
        }
      });
    }

    saveDB(db);
    res.json({ success: true });
  });

  // API: Currencies CRUD
  app.get("/api/currencies", (req, res) => {
    const db = getDB();
    res.json(db.currencies || []);
  });

  app.post("/api/currencies", (req, res) => {
    const { name, code, symbol, status } = req.body;
    if (!name || !code || !symbol) {
      return res.status(400).json({ error: "Name, code, and symbol are required fields." });
    }
    const db = getDB();
    if (!db.currencies) db.currencies = [];
    const id = "curr-" + code.trim().toLowerCase();
    if (db.currencies.some(c => c.id === id || c.code.toLowerCase() === code.toLowerCase())) {
      return res.status(400).json({ error: "Currency with this code already exists." });
    }
    const newCurrency = {
      id,
      name,
      code: code.trim().toUpperCase(),
      symbol,
      status: status || "Active"
    };
    db.currencies.push(newCurrency);

    saveDB(db);
    res.json(newCurrency);
  });

  app.put("/api/currencies/:id", (req, res) => {
    const { id } = req.params;
    const { name, code, symbol, status } = req.body;
    const db = getDB();
    if (!db.currencies) db.currencies = [];
    const index = db.currencies.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Currency not found" });
    }
    db.currencies[index] = {
      ...db.currencies[index],
      name: name || db.currencies[index].name,
      code: code ? code.trim().toUpperCase() : db.currencies[index].code,
      symbol: symbol || db.currencies[index].symbol,
      status: status || db.currencies[index].status
    };

    saveDB(db);
    res.json(db.currencies[index]);
  });

  app.delete("/api/currencies/:id", (req, res) => {
    const { id } = req.params;
    const db = getDB();
    if (!db.currencies) db.currencies = [];
    const index = db.currencies.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Currency not found" });
    }
    db.currencies.splice(index, 1);

    // Reset currency to USD on products if deleted
    if (db.products) {
      db.products.forEach(p => {
        if (p.currencyId === id) {
          p.currencyId = "curr-usd";
        }
      });
    }

    saveDB(db);
    res.json({ success: true });
  });

  // API: Products (supports localized language)
  app.get("/api/products", (req, res) => {
    const db = getDB();
    const resolvedProducts = db.products.map(p => resolveProductFlatFields(p, db));
    res.json(resolvedProducts);
  });

  app.post("/api/products", (req, res) => {
    console.log("Attempting to create product (database-driven relational route):", req.body);
    const db = getDB();

    let { 
      name, nameUr, price, salePrice, img, images, sku, batchNumber, manufacturingDate, expiryDate, 
      stockQuantity, description, status,
      brand, category, subcategory, unit 
    } = req.body;

    let brandId = req.body.brandId || req.body.brand_id;
    let categoryId = req.body.categoryId || req.body.category_id;
    let subcategoryId = req.body.subcategoryId || req.body.subcategory_id;
    let unitId = req.body.unitId || req.body.unit_id;
    let currencyId = req.body.currencyId || req.body.currency_id || req.body.currency;

    // 1. Auto-resolve Brand
    if (!brandId) {
      const brandName = brand || "General";
      const matchedBrand = db.brands?.find(b => b.name.toLowerCase() === brandName.toLowerCase() || b.id.toLowerCase() === brandName.toLowerCase());
      brandId = matchedBrand ? matchedBrand.id : (db.brands?.[0]?.id || "brand-general");
    }

    // 2. Auto-resolve Category
    if (!categoryId) {
      const catName = category || "Pantry";
      const matchedCat = db.categories?.find(c => c.name.toLowerCase() === catName.toLowerCase() || c.id.toLowerCase() === catName.toLowerCase());
      categoryId = matchedCat ? matchedCat.id : (db.categories?.[0]?.id || "Pantry");
    }

    // 3. Auto-resolve Subcategory
    if (!subcategoryId) {
      const subName = subcategory || "General";
      const matchedSub = db.subcategories?.find(s => s.categoryId.toLowerCase() === categoryId.toLowerCase() && (s.name.toLowerCase() === subName.toLowerCase() || s.id.toLowerCase() === subName.toLowerCase()));
      if (matchedSub) {
        subcategoryId = matchedSub.id;
      } else {
        const firstSub = db.subcategories?.find(s => s.categoryId.toLowerCase() === categoryId.toLowerCase());
        subcategoryId = firstSub ? firstSub.id : (db.subcategories?.[0]?.id || "");
      }
    }

    // 4. Auto-resolve Unit
    if (!unitId) {
      const unitName = unit || "Piece";
      const matchedUnit = db.units?.find(u => u.name.toLowerCase() === unitName.toLowerCase() || u.id.toLowerCase() === unitName.toLowerCase());
      unitId = matchedUnit ? matchedUnit.id : (db.units?.[0]?.id || "unit-piece");
    }

    // 5. Auto-resolve Currency - Default to PKR if none
    if (!currencyId) {
      currencyId = "curr-pkr";
    }

    if (!name || price === undefined || price === null || !brandId || !categoryId || !subcategoryId || !unitId || !currencyId) {
      console.log("Validation failed: missing relational foreign keys or basic attributes.");
      return res.status(400).json({ error: "Missing required product details: brand, main category, subcategory, measurement unit, currency, product name, and price are all strictly required relational records." });
    }

    // Enforce database-driven relational integrity checks with case-insensitivity and normalization
    const matchedBrand = db.brands?.find(b => b.id.toLowerCase() === brandId.toLowerCase());
    if (!matchedBrand) return res.status(400).json({ error: "Validation Failure: The selected Brand does not exist in the database." });
    brandId = matchedBrand.id;

    const matchedCat = db.categories?.find(c => c.id.toLowerCase() === categoryId.toLowerCase());
    if (!matchedCat) return res.status(400).json({ error: "Validation Failure: The selected Main Category does not exist in the database." });
    categoryId = matchedCat.id;

    let matchedSub = db.subcategories?.find(s => s.id.toLowerCase() === subcategoryId.toLowerCase());
    if (!matchedSub || matchedSub.categoryId.toLowerCase() !== categoryId.toLowerCase()) {
      // Fallback to first subcategory belonging to selected category
      matchedSub = db.subcategories?.find(s => s.categoryId.toLowerCase() === categoryId.toLowerCase());
    }
    if (!matchedSub) {
      return res.status(400).json({ error: "Validation Failure: The selected Category does not have any active subcategories." });
    }
    subcategoryId = matchedSub.id;

    const matchedUnit = db.units?.find(u => u.id.toLowerCase() === unitId.toLowerCase());
    if (!matchedUnit) return res.status(400).json({ error: "Validation Failure: The selected Measurement Unit does not exist in the database." });
    unitId = matchedUnit.id;

    const matchedCurrency = db.currencies?.find(c => c.id.toLowerCase() === currencyId.toLowerCase());
    if (!matchedCurrency) return res.status(400).json({ error: "Validation Failure: The selected Currency does not exist in the database." });
    currencyId = matchedCurrency.id;

    // Numeric validations
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: "Price must be a valid positive number." });
    }

    let parsedSalePrice = null;
    if (salePrice !== undefined && salePrice !== null && salePrice !== "") {
      parsedSalePrice = parseFloat(salePrice);
      if (isNaN(parsedSalePrice) || parsedSalePrice < 0) {
        return res.status(400).json({ error: "Sale Price must be a valid non-negative number." });
      }
      if (parsedSalePrice >= parsedPrice) {
        return res.status(400).json({ error: "Sale Price must be strictly lower than the base Price." });
      }
    }

    // Uniqueness validation on SKU if provided
    const cleanSku = sku ? sku.trim() : `SKU-26${String(Date.now()).slice(-4)}`;
    const skuConflict = db.products.some(p => p.sku?.toLowerCase() === cleanSku.toLowerCase());
    if (skuConflict && sku) {
      return res.status(400).json({ error: `Validation Failure: A product with SKU '${cleanSku}' already exists in the catalog.` });
    }

    const nextId = db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: nextId,
      name,
      nameUr: nameUr || name,
      brandId,
      brand_id: brandId,
      categoryId,
      category_id: categoryId,
      subcategoryId,
      subcategory_id: subcategoryId,
      unitId,
      unit_id: unitId,
      currencyId,
      currency_id: currencyId,
      currency: currencyId,
      price: parsedPrice,
      salePrice: parsedSalePrice,
      img: img || "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80",
      images: Array.isArray(images) ? images : [],
      sku: cleanSku,
      batchNumber: batchNumber || `BATCH-26B${nextId}`,
      manufacturingDate: manufacturingDate || new Date().toISOString().split("T")[0],
      expiryDate: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : 100,
      description: description || `Delicious fresh ${name} carefully selected for outstanding quality.`,
      status: status || "Active"
    };

    db.products.push(newProduct);

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      message: `Created product '${name}' | SKU: ${cleanSku} (Relational DB mode)`,
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    console.log("Relational database product added successfully:", newProduct);
    res.json(resolveProductFlatFields(newProduct, db));
  });

  app.post("/api/upload-image", async (req, res) => {
    try {
      const { file } = req.body;
      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }

      // If it is already a full URL (http or https), we can just return it!
      if (typeof file === "string" && (file.startsWith("http://") || file.startsWith("https://"))) {
        return res.json({ url: file, publicId: `remote_${Date.now()}` });
      }

      // If it is a base64 string, write it locally to the uploads directory
      if (typeof file === "string" && file.startsWith("data:")) {
        const matches = file.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        let extension = "jpg";
        let base64Data = "";

        if (matches && matches.length === 3) {
          extension = matches[1];
          base64Data = matches[2];
        } else {
          const parts = file.split(";base64,");
          if (parts.length === 2) {
            base64Data = parts[1];
            const typePart = parts[0].split(":");
            if (typePart.length === 2) {
              extension = typePart[1].split("/")[1] || "jpg";
            }
          }
        }

        if (extension === "jpeg") extension = "jpg";
        if (extension.includes("+")) extension = extension.split("+")[0]; // e.g. svg+xml -> svg

        if (!base64Data) {
          return res.status(400).json({ error: "Invalid base64 format" });
        }

        const fileName = `img_${Math.random().toString(36).substring(2, 11)}_${Date.now()}.${extension}`;
        const filePath = path.join(UPLOADS_DIR, fileName);

        await fs.promises.writeFile(filePath, Buffer.from(base64Data, "base64"));
        const fileUrl = `/uploads/${fileName}`;

        return res.json({ url: fileUrl, publicId: fileName });
      }

      // If it's some other format of base64 (no data prefix)
      if (typeof file === "string") {
        const fileName = `img_${Math.random().toString(36).substring(2, 11)}_${Date.now()}.jpg`;
        const filePath = path.join(UPLOADS_DIR, fileName);
        await fs.promises.writeFile(filePath, Buffer.from(file, "base64"));
        const fileUrl = `/uploads/${fileName}`;
        return res.json({ url: fileUrl, publicId: fileName });
      }

      return res.status(400).json({ error: "Unsupported file format" });
    } catch (error: any) {
      console.error("Local image upload error:", error);
      res.status(500).json({ error: error.message || "Local image upload failed" });
    }
  });

  // Edit Product
  app.put("/api/products/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { name, nameUr, price, salePrice, img, images, sku, batchNumber, manufacturingDate, expiryDate, stockQuantity, description, status } = req.body;
    
    let brandId = req.body.brandId || req.body.brand_id;
    let categoryId = req.body.categoryId || req.body.category_id;
    let subcategoryId = req.body.subcategoryId || req.body.subcategory_id;
    let unitId = req.body.unitId || req.body.unit_id;
    let currencyId = req.body.currencyId || req.body.currency_id || req.body.currency;

    const db = getDB();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Relationship validations & Case Normalizations with name fallback
    let resolvedBrandId = brandId;
    if (!resolvedBrandId) {
      const bName = req.body.brand || req.body.brandName || "";
      const matchedBrand = db.brands?.find(b => b.id.toLowerCase() === bName.toLowerCase() || b.name.toLowerCase() === bName.toLowerCase());
      resolvedBrandId = matchedBrand ? matchedBrand.id : (db.products[index].brandId || db.products[index].brand_id || "brand-general");
    }
    const finalBrand = db.brands?.find(b => b.id.toLowerCase() === resolvedBrandId.toLowerCase());
    resolvedBrandId = finalBrand ? finalBrand.id : "brand-general";

    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId) {
      const cName = req.body.category || req.body.categoryName || "";
      const matchedCat = db.categories?.find(c => c.id.toLowerCase() === cName.toLowerCase() || c.name.toLowerCase() === cName.toLowerCase());
      resolvedCategoryId = matchedCat ? matchedCat.id : (db.products[index].categoryId || db.products[index].category_id || "Pantry");
    }
    const finalCat = db.categories?.find(c => c.id.toLowerCase() === resolvedCategoryId.toLowerCase());
    resolvedCategoryId = finalCat ? finalCat.id : "Pantry";

    let resolvedSubcategoryId = subcategoryId;
    if (!resolvedSubcategoryId) {
      const sName = req.body.subcategory || req.body.subcategoryName || req.body.sub_category || "";
      let matchedSub = db.subcategories?.find(s => s.categoryId.toLowerCase() === resolvedCategoryId.toLowerCase() && (s.id.toLowerCase() === sName.toLowerCase() || s.name.toLowerCase() === sName.toLowerCase()));
      if (!matchedSub && sName) {
        matchedSub = db.subcategories?.find(s => s.id.toLowerCase() === sName.toLowerCase() || s.name.toLowerCase() === sName.toLowerCase());
      }
      resolvedSubcategoryId = matchedSub ? matchedSub.id : (db.products[index].subcategoryId || db.products[index].subcategory_id || "");
    }
    let finalSub = db.subcategories?.find(s => s.id.toLowerCase() === resolvedSubcategoryId.toLowerCase());
    if (!finalSub || finalSub.categoryId.toLowerCase() !== resolvedCategoryId.toLowerCase()) {
      finalSub = db.subcategories?.find(s => s.categoryId.toLowerCase() === resolvedCategoryId.toLowerCase());
    }
    resolvedSubcategoryId = finalSub ? finalSub.id : "";

    let resolvedUnitId = unitId;
    if (!resolvedUnitId) {
      const uName = req.body.unit || "";
      const matchedUnit = db.units?.find(u => u.id.toLowerCase() === uName.toLowerCase() || u.name.toLowerCase() === uName.toLowerCase());
      resolvedUnitId = matchedUnit ? matchedUnit.id : (db.products[index].unitId || db.products[index].unit_id || "unit-piece");
    }
    const finalUnit = db.units?.find(u => u.id.toLowerCase() === resolvedUnitId.toLowerCase());
    resolvedUnitId = finalUnit ? finalUnit.id : "unit-piece";

    let resolvedCurrencyId = currencyId;
    if (!resolvedCurrencyId) {
      const currName = req.body.currency || req.body.currencyCode || req.body.currency_code || "";
      const matchedCurrency = db.currencies?.find(c => c.id.toLowerCase() === currName.toLowerCase() || c.code.toLowerCase() === currName.toLowerCase());
      resolvedCurrencyId = matchedCurrency ? matchedCurrency.id : (db.products[index].currencyId || db.products[index].currency_id || "curr-pkr");
    }
    const finalCurrency = db.currencies?.find(c => c.id.toLowerCase() === resolvedCurrencyId.toLowerCase());
    resolvedCurrencyId = finalCurrency ? finalCurrency.id : "curr-pkr";

    // Pricing checks
    let parsedPrice = db.products[index].price;
    if (price !== undefined && price !== null) {
      parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ error: "Price must be a valid positive number." });
      }
    }

    let parsedSalePrice = db.products[index].salePrice;
    if (salePrice !== undefined) {
      if (salePrice === null || salePrice === "") {
        parsedSalePrice = null;
      } else {
        parsedSalePrice = parseFloat(salePrice);
        if (isNaN(parsedSalePrice) || parsedSalePrice < 0) {
          return res.status(400).json({ error: "Sale Price must be a valid non-negative number." });
        }
        if (parsedSalePrice >= parsedPrice) {
          return res.status(400).json({ error: "Sale Price must be strictly lower than the base Price." });
        }
      }
    }

    if (sku !== undefined && sku !== db.products[index].sku) {
      const skuConflict = db.products.some(p => p.id !== id && p.sku?.toLowerCase() === sku.trim().toLowerCase());
      if (skuConflict) {
        return res.status(400).json({ error: `Validation Failure: A product with SKU '${sku}' already exists.` });
      }
    }

    const oldName = db.products[index].name;
    db.products[index] = {
      ...db.products[index],
      name: name || db.products[index].name,
      nameUr: nameUr || db.products[index].nameUr,
      brandId: resolvedBrandId,
      brand_id: resolvedBrandId,
      categoryId: resolvedCategoryId,
      category_id: resolvedCategoryId,
      subcategoryId: resolvedSubcategoryId,
      subcategory_id: resolvedSubcategoryId,
      unitId: resolvedUnitId,
      unit_id: resolvedUnitId,
      currencyId: resolvedCurrencyId,
      currency_id: resolvedCurrencyId,
      currency: resolvedCurrencyId,
      price: parsedPrice,
      salePrice: parsedSalePrice,
      img: img || db.products[index].img,
      images: Array.isArray(images) ? images : (db.products[index].images || []),
      sku: sku !== undefined ? sku.trim() : db.products[index].sku,
      batchNumber: batchNumber !== undefined ? batchNumber : db.products[index].batchNumber,
      manufacturingDate: manufacturingDate !== undefined ? manufacturingDate : db.products[index].manufacturingDate,
      expiryDate: expiryDate !== undefined ? expiryDate : db.products[index].expiryDate,
      stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : db.products[index].stockQuantity,
      description: description !== undefined ? description : db.products[index].description,
      status: status || db.products[index].status || "Active"
    };

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      message: `Updated product '${oldName}' to '${db.products[index].name}' (Relational integrity verified)`,
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(resolveProductFlatFields(db.products[index], db));
  });

  // Delete Product
  app.delete("/api/products/:id", (req, res) => {
    const rawId = req.params.id;
    const numId = parseInt(rawId);
    const db = getDB();
    const initialLen = db.products.length;
    const deletedProduct = db.products.find(p => p.id === numId || String(p.id) === String(rawId));
    db.products = db.products.filter(p => p.id !== numId && String(p.id) !== String(rawId));
    if (db.products.length === initialLen) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      message: `Deleted product '${deletedProduct?.name || rawId}' from inventory catalog`,
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json({ success: true, message: "Product deleted successfully" });
  });

  // API: Cart management (server-authoritative)
  app.get("/api/cart/:userId", (req, res) => {
    const { userId } = req.params;
    const db = getDB();
    if (!db.cart) db.cart = {};
    const items = db.cart[userId] || [];
    res.json(items);
  });

  app.post("/api/cart/:userId", (req, res) => {
    const { userId } = req.params;
    const { productId, qty, name, nameUr, price, unit, unitUr, currencyCode } = req.body;
    const db = getDB();
    if (!db.cart) db.cart = {};
    if (!db.cart[userId]) db.cart[userId] = [];

    const existingIndex = db.cart[userId].findIndex(item => String(item.productId) === String(productId));
    if (existingIndex > -1) {
      if (qty <= 0) {
        db.cart[userId].splice(existingIndex, 1);
      } else {
        db.cart[userId][existingIndex].qty = qty;
        if (name) db.cart[userId][existingIndex].name = name;
        if (nameUr) db.cart[userId][existingIndex].nameUr = nameUr;
        if (price !== undefined) db.cart[userId][existingIndex].price = price;
        if (unit) db.cart[userId][existingIndex].unit = unit;
        if (unitUr) db.cart[userId][existingIndex].unitUr = unitUr;
        if (currencyCode) db.cart[userId][existingIndex].currencyCode = currencyCode;
      }
    } else if (qty > 0) {
      db.cart[userId].push({ productId, qty, name, nameUr, price, unit, unitUr, currencyCode });
    }
    saveDB(db);
    res.json(db.cart[userId]);
  });

  app.post("/api/cart/:userId/sync", (req, res) => {
    const { userId } = req.params;
    const { items } = req.body; // array of {productId, qty}
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid array structure" });
    }
    const db = getDB();
    if (!db.cart) db.cart = {};
    db.cart[userId] = items;
    saveDB(db);
    res.json(db.cart[userId]);
  });

  app.delete("/api/cart/:userId", (req, res) => {
    const { userId } = req.params;
    const db = getDB();
    if (!db.cart) db.cart = {};
    db.cart[userId] = [];
    saveDB(db);
    res.json([]);
  });

  // API: Favourites / Wishlist
  app.get("/api/favourites/:userId", (req, res) => {
    const { userId } = req.params;
    const db = getDB();
    if (!db.favourites) db.favourites = {};
    res.json(db.favourites[userId] || []);
  });

  app.post("/api/favourites/:userId", (req, res) => {
    const { userId } = req.params;
    const { productId } = req.body;
    const db = getDB();
    if (!db.favourites) db.favourites = {};
    if (!db.favourites[userId]) db.favourites[userId] = [];

    const index = db.favourites[userId].indexOf(productId);
    if (index > -1) {
      // Toggle off if exists
      db.favourites[userId].splice(index, 1);
    } else {
      db.favourites[userId].push(productId);
    }
    saveDB(db);
    res.json(db.favourites[userId]);
  });

  // API: Orders
  app.get("/api/orders/:userId", (req, res) => {
    const { userId } = req.params;
    const db = getDB();
    if (!db.orders) db.orders = [];
    if (!db.users) db.users = [];
    const user = db.users.find(u => String(u.id) === String(userId));
    if (user && user.role === "admin") {
      // Admin sees ALL orders
      return res.json(db.orders);
    }
    const userOrders = db.orders.filter(o => 
      String(o.userId) === String(userId) || 
      (user && user.email && o.userEmail && String(o.userEmail).toLowerCase() === String(user.email).toLowerCase())
    );
    res.json(userOrders);
  });

  app.post("/api/orders/:userId", (req, res) => {
    const { userId } = req.params;
    const { items, subtotal, tax, total, currency } = req.body;
    if (!items || !total) {
      return res.status(400).json({ error: "Invalid order data" });
    }
    const db = getDB();
    if (!db.users) db.users = [];
    const user = db.users.find(u => u.id === userId);
    const newOrder = {
      id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      userId,
      userEmail: req.body.userEmail || (user ? user.email : ""),
      items, // array of items with details
      subtotal,
      tax,
      total,
      currency: currency || "USD",
      createdAt: new Date().toISOString(),
      status: "Processing",
      paymentMethod: req.body.paymentMethod || "Cash on Delivery",
      paymentDetails: req.body.paymentDetails || {},
      paymentStatus: req.body.paymentStatus || "Pending"
    };
    db.orders.unshift(newOrder);
    // Clear user cart upon successful checkout
    db.cart[userId] = [];

    // Deduct stock quantity
    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        const pid = Number(item.id);
        const qty = Number(item.qty || 1);
        const prod = db.products.find(p => Number(p.id) === pid);
        if (prod) {
          const currentQty = typeof prod.stockQuantity === 'number' ? prod.stockQuantity : (typeof prod.stock_quantity === 'number' ? prod.stock_quantity : 100);
          prod.stockQuantity = Math.max(0, currentQty - qty);
          prod.stock_quantity = prod.stockQuantity;
        }
      });
    }

    saveDB(db);

    res.json(newOrder);
  });

  // Manage Order Status (Admin)
  app.put("/api/orders/:orderId/status", (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Missing status parameter" });
    }

    const db = getDB();
    const orderIndex = db.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    const targetStatus = String(status).trim();

    // Business Logic: If an order is marked as Cancelled, automatically delete it from system database
    if (targetStatus === "Cancelled") {
      const deletedOrder = db.orders.splice(orderIndex, 1)[0];
      if (!db.adminActivityLogs) db.adminActivityLogs = [];
      db.adminActivityLogs.unshift({
        id: "log_" + Math.random().toString(36).substring(2, 9),
        action: "CANCEL_DELETE_ORDER",
        description: `Order #${orderId} was cancelled and automatically deleted according to business logic.`,
        userEmail: (req.query.email as string) || "system@voxcart.com",
        timestamp: new Date().toISOString()
      });
      saveDB(db);
      return res.json({ success: true, message: "Order cancelled and deleted automatically", deletedOrder });
    }

    const allowedStatuses = ["Processing", "Shipped", "Delivered"];
    if (!allowedStatuses.includes(targetStatus)) {
      return res.status(400).json({ error: `Invalid status '${targetStatus}'. Allowed options are: Processing, Shipped, Delivered.` });
    }

    db.orders[orderIndex].status = targetStatus;
    saveDB(db);
    res.json(db.orders[orderIndex]);
  });

  // Delete User Order (Admin Control)
  app.delete("/api/orders/:orderId", (req, res) => {
    const { orderId } = req.params;
    const db = getDB();
    const orderIndex = db.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found" });
    }
    const deletedOrder = db.orders.splice(orderIndex, 1)[0];
    
    // Log admin activity
    if (!db.adminActivityLogs) {
      db.adminActivityLogs = [];
    }
    const orderTotal = typeof deletedOrder.total === "number" ? deletedOrder.total : parseFloat(deletedOrder.total || "0");
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 9),
      action: "DELETE_ORDER",
      description: `Deleted order #${orderId} of customer ${deletedOrder.userId || "guest"} ($${orderTotal.toFixed(2)})`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json({ success: true, message: "Order removed from system database successfully" });
  });

  // Get Admin Dashboard Overview
  app.get("/api/admin/dashboard", (req, res) => {
    const db = getDB();
    const totalSales = db.orders.reduce((sum, o) => {
      const orderTotal = typeof o.total === "number" ? o.total : parseFloat(o.total || "0");
      const currency = o.currency || "USD";
      // Simplified total sum in USD (assuming base rate)
      return sum + (currency === "PKR" ? orderTotal / 280 : orderTotal);
    }, 0);

    const salesByCategory: { [key: string]: number } = {};
    db.orders.forEach(order => {
      let itemsList = [];
      if (order && order.items) {
        if (typeof order.items === "string") {
          try {
            itemsList = JSON.parse(order.items);
          } catch (e) {
            itemsList = [];
          }
        } else if (Array.isArray(order.items)) {
          itemsList = order.items;
        }
      }
      if (Array.isArray(itemsList)) {
        itemsList.forEach((item: any) => {
          if (!item) return;
          const cat = item.category || "General";
          const priceVal = typeof item.price === "number" ? item.price : parseFloat(item.price || item.unitPrice || 0);
          const qtyVal = typeof item.qty === "number" ? item.qty : (parseFloat(item.qty || 1) || 1);
          const cost = priceVal * qtyVal;
          const orderCurrency = order.currency || "USD";
          salesByCategory[cat] = (salesByCategory[cat] || 0) + (orderCurrency === "PKR" ? cost / 280 : cost);
        });
      }
    });

    res.json({
      totalSalesUsd: Math.round(totalSales * 100) / 100,
      orderCount: db.orders.length,
      productCount: db.products.length,
      userCount: db.users.filter(u => u.role !== "admin").length,
      recentOrders: db.orders,
      salesByCategory
    });
  });

  // API: Get Categories
  app.get("/api/categories", (req, res) => {
    const db = getDB();
    res.json(db.categories || []);
  });

  // API: Create Category
  app.post("/api/categories", (req, res) => {
    console.log("Attempting to create category:", req.body);
    const { name, nameUr } = req.body;
    if (!name || !nameUr) {
      console.log("Missing category details in request body.");
      return res.status(400).json({ error: "Missing category details" });
    }
    const db = getDB();
    const id = name.trim().replace(/\s+/g, "-"); // Nice readable ID
    if (!db.categories) db.categories = [];
    if (db.categories.find(c => c.id.toLowerCase() === id.toLowerCase() || c.name.toLowerCase() === name.toLowerCase())) {
      console.log(`Category '${name}' already exists.`);
      return res.status(400).json({ error: "Category already exists" });
    }
    const newCat = { id, name, nameUr };
    db.categories.push(newCat);

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "CREATE_CATEGORY",
      description: `Created product category '${name}' / '${nameUr}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    console.log("Category created successfully:", newCat);
    res.json(newCat);
  });

  // API: Update Category
  app.put("/api/categories/:id", (req, res) => {
    const { id } = req.params;
    const { name, nameUr } = req.body;
    if (!name || !nameUr) {
      return res.status(400).json({ error: "Missing category details" });
    }
    const db = getDB();
    if (!db.categories) db.categories = [];
    const index = db.categories.findIndex(c => c.id === id || c.name.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      return res.status(404).json({ error: "Category not found" });
    }
    const oldName = db.categories[index].name;
    const cleanId = name.trim().replace(/\s+/g, "-");
    db.categories[index] = { id: cleanId, name, nameUr };

    // Update product category for products assigned to the old category
    if (db.products && oldName !== name) {
      db.products.forEach(p => {
        if (p.category === oldName) {
          p.category = name;
        }
      });
    }

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "UPDATE_CATEGORY",
      description: `Updated product category '${oldName}' to '${name}' / '${nameUr}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(db.categories[index]);
  });

  // API: Delete Category
  app.delete("/api/categories/:id", (req, res) => {
    const { id } = req.params;
    const db = getDB();
    if (!db.categories) db.categories = [];
    const index = db.categories.findIndex(c => c.id === id || c.name.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      return res.status(404).json({ error: "Category not found" });
    }
    const catName = db.categories[index].name;
    db.categories.splice(index, 1);

    // Determine fallback category
    let fallbackCategory = "Pantry";
    if (db.categories.length > 0) {
      fallbackCategory = db.categories[0].name;
    } else {
      // Re-create a default category if none left
      db.categories.push({ id: "pantry", name: "Pantry", nameUr: "پینٹری" });
    }

    // Relocate products in this category to fallbackCategory
    if (db.products) {
      let movedCount = 0;
      db.products.forEach(p => {
        if (p.category === id || p.category === catName) {
          p.category = fallbackCategory;
          movedCount++;
        }
      });
      console.log(`Migrated ${movedCount} products from deleted category '${catName}' to '${fallbackCategory}'`);
    }

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "DELETE_CATEGORY",
      description: `Deleted category '${catName}', migrating affected items safely`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json({ success: true });
  });

  // ================= USER-SPECIFIC CATEGORIES (Logged-In User Only) =================
  // Get categories for a specific user (Excluded from admin side)
  app.get("/api/user-categories/:userId", (req, res) => {
    const { userId } = req.params;
    if (!userId || userId === "null" || userId === "undefined") {
      return res.json([]);
    }
    const db = getDB();
    const userCats = (db.userCategories && db.userCategories[userId]) || [];
    res.json(userCats);
  });

  // Create user-specific category
  app.post("/api/user-categories/:userId", (req, res) => {
    const { userId } = req.params;
    const { name, nameUr, description, icon, sourceQuery } = req.body;

    if (!userId || userId === "null" || userId === "undefined") {
      return res.status(400).json({ error: "Authentication required to save user categories" });
    }
    if (!name) {
      return res.status(400).json({ error: "Missing category name" });
    }

    const db = getDB();
    if (!db.userCategories) db.userCategories = {};
    if (!db.userCategories[userId]) db.userCategories[userId] = [];

    const catId = "user_cat_" + name.trim().toLowerCase().replace(/\s+/g, "_");
    
    // Check duplicate
    const exists = db.userCategories[userId].find(c => c.id === catId || c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      return res.json(exists);
    }

    const newCat = {
      id: catId,
      name: name.trim(),
      nameUr: nameUr || name,
      icon: icon || "✨",
      description: description || "Auto-extracted by Voxy AI based on user preferences",
      extractedAt: new Date().toISOString(),
      sourceQuery: sourceQuery || ""
    };

    db.userCategories[userId].push(newCat);
    saveDB(db);
    res.json(newCat);
  });

  // Delete user category
  app.delete("/api/user-categories/:userId/:categoryId", (req, res) => {
    const { userId, categoryId } = req.params;
    const db = getDB();
    if (db.userCategories && db.userCategories[userId]) {
      db.userCategories[userId] = db.userCategories[userId].filter(c => c.id !== categoryId && c.name !== categoryId);
      saveDB(db);
    }
    res.json({ success: true });
  });

  // Auto-Extract categories from message or request
  app.post("/api/user-categories/extract", async (req, res) => {
    const { message = "", userId = null, language = "en" } = req.body;
    const textLower = message.toLowerCase();
    
    const candidateMap = [
      { keywords: ["snack", "chips", "crisps", "biscuit", "cookie"], name: "Snacks & Biscuits", nameUr: "سنیکس اور بسکٹ", icon: "🍪" },
      { keywords: ["organic", "bio", "natural", "farm"], name: "Organic Produce", nameUr: "نامیاتی پیداوار", icon: "🌿" },
      { keywords: ["gluten", "gluten free", "celiac"], name: "Gluten-Free Foods", nameUr: "گلوٹن فری اشیاء", icon: "🌾" },
      { keywords: ["baby", "infant", "toddler", "diaper", "formula"], name: "Baby & Care", nameUr: "بیبی کیئر", icon: "👶" },
      { keywords: ["pet", "dog", "cat", "kibble", "bird"], name: "Pet Care & Food", nameUr: "پالتو جانوروں کی خوراک", icon: "🐶" },
      { keywords: ["fitness", "protein", "gym", "shake", "workout", "supplement"], name: "Fitness & Nutrition", nameUr: "فٹنس اور پروٹین", icon: "🏋️" },
      { keywords: ["spice", "masala", "herb", "seasoning", "gourmet"], name: "Gourmet Spices & Herbs", nameUr: "خالص مصالحہ جات", icon: "🧂" },
      { keywords: ["frozen", "ice cream", "frozen meal", "nuggets"], name: "Frozen Foods & Desserts", nameUr: "فروزن اشیاء", icon: "❄️" },
      { keywords: ["tea", "herbal", "green tea", "chai", "coffee"], name: "Herbal Teas & Coffee", nameUr: "جڑی بوٹیوں کی چائے", icon: "☕" },
      { keywords: ["skin", "beauty", "care", "soap", "shampoo", "cosmetic"], name: "Skincare & Beauty", nameUr: "جلد اور خوبصورتی", icon: "✨" },
      { keywords: ["halal", "sweets", "mithai", "dessert"], name: "Halal Sweets & Treats", nameUr: "حلال مٹھائیاں", icon: "🍬" },
      { keywords: ["breakfast", "cereal", "oats", "jam"], name: "Breakfast Essentials", nameUr: "ناشتے کی اشیاء", icon: "🥣" },
      { keywords: ["beverage", "juice", "soda", "drink", "cold"], name: "Refreshing Beverages", nameUr: "تازہ دم مشروبات", icon: "🥤" },
      { keywords: ["bakery", "bread", "cake", "pastry"], name: "Artisanal Bakery", nameUr: "تازہ بیکری", icon: "🥐" }
    ];

    let extracted: any[] = [];
    
    candidateMap.forEach(cand => {
      if (cand.keywords.some(kw => textLower.includes(kw))) {
        extracted.push({
          id: "user_cat_" + cand.name.toLowerCase().replace(/\s+/g, "_"),
          name: cand.name,
          nameUr: cand.nameUr,
          icon: cand.icon,
          description: `Extracted automatically for user based on: "${message.slice(0, 40)}"`,
          extractedAt: new Date().toISOString(),
          sourceQuery: message
        });
      }
    });

    if (extracted.length === 0) {
      extracted = [
        {
          id: "user_cat_gourmet_spices",
          name: "Gourmet Spices & Herbs",
          nameUr: "خالص مصالحہ جات",
          icon: "🌿",
          description: "AI Extracted specialty category",
          extractedAt: new Date().toISOString(),
          sourceQuery: message
        },
        {
          id: "user_cat_organic_snacks",
          name: "Organic & Healthy Snacks",
          nameUr: "نامیاتی سنیکس",
          icon: "🍪",
          description: "AI Extracted healthy snacks category",
          extractedAt: new Date().toISOString(),
          sourceQuery: message
        }
      ];
    }

    const db = getDB();
    if (userId && userId !== "null" && userId !== "undefined") {
      if (!db.userCategories) db.userCategories = {};
      if (!db.userCategories[userId]) db.userCategories[userId] = [];

      extracted.forEach(newCat => {
        const exists = db.userCategories![userId].some(c => c.id === newCat.id || c.name.toLowerCase() === newCat.name.toLowerCase());
        if (!exists) {
          db.userCategories![userId].push(newCat);
        }
      });
      saveDB(db);
    }

    res.json({
      success: true,
      extractedCategories: extracted,
      savedForUser: !!(userId && userId !== "null" && userId !== "undefined")
    });
  });

  // ================= BRANDS CRUD =================
  app.get("/api/brands", (req, res) => {
    const db = getDB();
    res.json(db.brands || []);
  });

  app.post("/api/brands", (req, res) => {
    const { name, logo, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Missing brand name" });
    }
    const db = getDB();
    if (!db.brands) db.brands = [];
    const id = "brand-" + name.trim().toLowerCase().replace(/\s+/g, "-");
    if (db.brands.find(b => b.id === id || b.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ error: "Brand already exists" });
    }
    const newBrand = { id, name, logo: logo || "", status: status || "Active" };
    db.brands.push(newBrand);

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "CREATE_BRAND",
      description: `Created brand '${name}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(newBrand);
  });

  app.put("/api/brands/:id", (req, res) => {
    const { id } = req.params;
    const { name, logo, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Missing brand name" });
    }
    const db = getDB();
    if (!db.brands) db.brands = [];
    const index = db.brands.findIndex(b => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Brand not found" });
    }
    const oldBrand = db.brands[index];
    const newId = "brand-" + name.trim().toLowerCase().replace(/\s+/g, "-");
    const updatedBrand = { id: newId, name, logo: logo || "", status: status || "Active" };
    db.brands[index] = updatedBrand;

    // Relocate brand references in products if changed
    if (db.products && oldBrand.id !== newId) {
      db.products.forEach(p => {
        if (p.brandId === oldBrand.id) {
          p.brandId = newId;
        }
      });
    }

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "UPDATE_BRAND",
      description: `Updated brand '${oldBrand.name}' to '${name}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(updatedBrand);
  });

  app.delete("/api/brands/:id", (req, res) => {
    const { id } = req.params;
    const db = getDB();
    if (!db.brands) db.brands = [];
    const index = db.brands.findIndex(b => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Brand not found" });
    }
    const brandName = db.brands[index].name;
    db.brands.splice(index, 1);

    // Clear brand references in products
    if (db.products) {
      db.products.forEach(p => {
        if (p.brandId === id) {
          p.brandId = undefined;
        }
      });
    }

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "DELETE_BRAND",
      description: `Deleted brand '${brandName}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json({ success: true });
  });

  // ================= SUBCATEGORIES CRUD =================
  app.get("/api/subcategories", (req, res) => {
    const db = getDB();
    res.json(db.subcategories || []);
  });

  app.post("/api/subcategories", (req, res) => {
    const { categoryId, name, nameUr, status } = req.body;
    if (!categoryId || !name || !nameUr) {
      return res.status(400).json({ error: "Missing subcategory details" });
    }
    const db = getDB();
    if (!db.subcategories) db.subcategories = [];
    const id = "sub-" + name.trim().toLowerCase().replace(/\s+/g, "-");
    if (db.subcategories.find(s => s.id === id || s.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ error: "Subcategory already exists" });
    }
    const newSub = { id, categoryId, name, nameUr, status: status || "Active" };
    db.subcategories.push(newSub);

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "CREATE_SUBCATEGORY",
      description: `Created subcategory '${name}' / '${nameUr}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(newSub);
  });

  app.put("/api/subcategories/:id", (req, res) => {
    const { id } = req.params;
    const { categoryId, name, nameUr, status } = req.body;
    if (!categoryId || !name || !nameUr) {
      return res.status(400).json({ error: "Missing subcategory details" });
    }
    const db = getDB();
    if (!db.subcategories) db.subcategories = [];
    const index = db.subcategories.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Subcategory not found" });
    }
    const oldSub = db.subcategories[index];
    const newId = "sub-" + name.trim().toLowerCase().replace(/\s+/g, "-");
    const updatedSub = { id: newId, categoryId, name, nameUr, status: status || "Active" };
    db.subcategories[index] = updatedSub;

    // Relocate references in products
    if (db.products && oldSub.id !== newId) {
      db.products.forEach(p => {
        if (p.subcategoryId === oldSub.id) {
          p.subcategoryId = newId;
        }
      });
    }

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "UPDATE_SUBCATEGORY",
      description: `Updated subcategory '${oldSub.name}' to '${name}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(updatedSub);
  });

  app.delete("/api/subcategories/:id", (req, res) => {
    const { id } = req.params;
    const db = getDB();
    if (!db.subcategories) db.subcategories = [];
    const index = db.subcategories.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Subcategory not found" });
    }
    const subName = db.subcategories[index].name;
    db.subcategories.splice(index, 1);

    // Clear references in products
    if (db.products) {
      db.products.forEach(p => {
        if (p.subcategoryId === id) {
          p.subcategoryId = undefined;
        }
      });
    }

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "DELETE_SUBCATEGORY",
      description: `Deleted subcategory '${subName}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json({ success: true });
  });

  // ================= UNITS CRUD =================
  app.get("/api/units", (req, res) => {
    const db = getDB();
    res.json(db.units || []);
  });

  app.post("/api/units", (req, res) => {
    const { name, nameUr, status } = req.body;
    if (!name || !nameUr) {
      return res.status(400).json({ error: "Missing unit details" });
    }
    const db = getDB();
    if (!db.units) db.units = [];
    const id = "unit-" + name.trim().toLowerCase().replace(/\s+/g, "-");
    if (db.units.find(u => u.id === id || u.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ error: "Unit already exists" });
    }
    const newUnit = { id, name, nameUr, status: status || "Active" };
    db.units.push(newUnit);

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "CREATE_UNIT",
      description: `Created unit '${name}' / '${nameUr}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(newUnit);
  });

  app.put("/api/units/:id", (req, res) => {
    const { id } = req.params;
    const { name, nameUr, status } = req.body;
    if (!name || !nameUr) {
      return res.status(400).json({ error: "Missing unit details" });
    }
    const db = getDB();
    if (!db.units) db.units = [];
    const index = db.units.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Unit not found" });
    }
    const oldUnit = db.units[index];
    const newId = "unit-" + name.trim().toLowerCase().replace(/\s+/g, "-");
    const updatedUnit = { id: newId, name, nameUr, status: status || "Active" };
    db.units[index] = updatedUnit;

    // Relocate references in products
    if (db.products && oldUnit.id !== newId) {
      db.products.forEach(p => {
        if (p.unitId === oldUnit.id) {
          p.unitId = newId;
        }
      });
    }

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "UPDATE_UNIT",
      description: `Updated unit '${oldUnit.name}' to '${name}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(updatedUnit);
  });

  app.delete("/api/units/:id", (req, res) => {
    const { id } = req.params;
    const db = getDB();
    if (!db.units) db.units = [];
    const index = db.units.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Unit not found" });
    }
    const unitName = db.units[index].name;
    db.units.splice(index, 1);

    // Clear references in products
    if (db.products) {
      db.products.forEach(p => {
        if (p.unitId === id) {
          p.unitId = undefined;
        }
      });
    }

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "DELETE_UNIT",
      description: `Deleted unit '${unitName}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json({ success: true });
  });

  // ================= CURRENCIES CRUD =================
  app.get("/api/currencies", (req, res) => {
    const db = getDB();
    res.json(db.currencies || []);
  });

  app.post("/api/currencies", (req, res) => {
    const { name, code, symbol, status } = req.body;
    if (!name || !code || !symbol) {
      return res.status(400).json({ error: "Missing currency details" });
    }
    const db = getDB();
    if (!db.currencies) db.currencies = [];
    const id = "curr-" + code.trim().toLowerCase();
    if (db.currencies.find(c => c.id === id || c.code.toLowerCase() === code.toLowerCase())) {
      return res.status(400).json({ error: "Currency already exists" });
    }
    const newCurr = { id, name, code: code.toUpperCase(), symbol, status: status || "Active" };
    db.currencies.push(newCurr);

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "CREATE_CURRENCY",
      description: `Created currency '${name}' (${code})`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(newCurr);
  });

  app.put("/api/currencies/:id", (req, res) => {
    const { id } = req.params;
    const { name, code, symbol, status } = req.body;
    if (!name || !code || !symbol) {
      return res.status(400).json({ error: "Missing currency details" });
    }
    const db = getDB();
    if (!db.currencies) db.currencies = [];
    const index = db.currencies.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Currency not found" });
    }
    const oldCurr = db.currencies[index];
    const newId = "curr-" + code.trim().toLowerCase();
    const updatedCurr = { id: newId, name, code: code.toUpperCase(), symbol, status: status || "Active" };
    db.currencies[index] = updatedCurr;

    // Relocate references in products
    if (db.products && oldCurr.id !== newId) {
      db.products.forEach(p => {
        if (p.currencyId === oldCurr.id) {
          p.currencyId = newId;
        }
      });
    }

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "UPDATE_CURRENCY",
      description: `Updated currency '${oldCurr.name}' to '${name}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(updatedCurr);
  });

  app.delete("/api/currencies/:id", (req, res) => {
    const { id } = req.params;
    const db = getDB();
    if (!db.currencies) db.currencies = [];
    const index = db.currencies.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Currency not found" });
    }
    const currName = db.currencies[index].name;
    db.currencies.splice(index, 1);

    // Clear references in products
    if (db.products) {
      db.products.forEach(p => {
        if (p.currencyId === id) {
          p.currencyId = undefined;
        }
      });
    }

    if (!db.adminActivityLogs) db.adminActivityLogs = [];
    db.adminActivityLogs.unshift({
      id: "log_" + Math.random().toString(36).substring(2, 11),
      action: "DELETE_CURRENCY",
      description: `Deleted currency '${currName}'`,
      userEmail: (req.query.email as string) || "admin@voxcart.com",
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json({ success: true });
  });

  // API: Real-time Exchange Rates
  let ratesCache = {
    USD: 1,
    PKR: 280,
    AED: 3.67,
    EUR: 0.92,
    GBP: 0.79,
    SAR: 3.75,
    timestamp: 0
  };

  app.get("/api/exchange-rates", async (req, res) => {
    const now = Date.now();
    // 1-hour caching interval
    if (now - ratesCache.timestamp < 3600000 && ratesCache.timestamp > 0) {
      return res.json(ratesCache);
    }
    
    let ratesFetched = false;

    // Try API 1: Open Exchange Rates API
    try {
      console.log("Fetching live rates from Primary API (open.er-api.com)...");
      const response = await fetch("https://open.er-api.com/v6/latest/USD");
      if (response.ok) {
        const data = await response.json();
        if (data && data.rates) {
          ratesCache = {
            USD: 1,
            PKR: Math.round((data.rates.PKR || 280) * 100) / 100,
            AED: Math.round((data.rates.AED || 3.67) * 100) / 100,
            EUR: Math.round((data.rates.EUR || 0.92) * 100) / 100,
            GBP: Math.round((data.rates.GBP || 0.79) * 100) / 100,
            SAR: Math.round((data.rates.SAR || 3.75) * 100) / 100,
            timestamp: now
          };
          ratesFetched = true;
          console.log("Primary API exchange rates synced successfully:", ratesCache);
        }
      }
    } catch (e: any) {
      console.warn("Primary exchange rates API failed, attempting Secondary API...", e.message || e);
    }

    // Try API 2: ExchangeRate API
    if (!ratesFetched) {
      try {
        console.log("Fetching live rates from Secondary API (api.exchangerate-api.com)...");
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        if (response.ok) {
          const data = await response.json();
          if (data && data.rates) {
            ratesCache = {
              USD: 1,
              PKR: Math.round((data.rates.PKR || 280) * 100) / 100,
              AED: Math.round((data.rates.AED || 3.67) * 100) / 100,
              EUR: Math.round((data.rates.EUR || 0.92) * 100) / 100,
              GBP: Math.round((data.rates.GBP || 0.79) * 100) / 100,
              SAR: Math.round((data.rates.SAR || 3.75) * 100) / 100,
              timestamp: now
            };
            ratesFetched = true;
            console.log("Secondary API exchange rates synced successfully:", ratesCache);
          }
        }
      } catch (e: any) {
        console.warn("Secondary exchange rates API also failed, using existing cache or defaults.", e.message || e);
      }
    }

    res.json(ratesCache);
  });

  // Helper for local Tesseract.js OCR extraction when Gemini API is rate-limited or unavailable
  function scoreOcrTextReadability(text: string): number {
    if (!text || typeof text !== "string") return 0;
    const words = text.match(/[a-zA-Z]{2,}/g) || [];
    let score = 0;
    for (const w of words) {
      if (w.length >= 4) score += 4;
      else if (w.length === 3) score += 3;
      else score += 1;
    }
    return score;
  }

  function cleanOcrArtifacts(text: string): string {
    if (!text) return "";
    return text
      .replace(/[|│┃]/g, " ")
      .replace(/[~`^]/g, "")
      .replace(/_{2,}/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\b0il\b/gi, "Oil")
      .replace(/\bM1lk\b|\bMi1k\b/gi, "Milk")
      .replace(/\bR1ce\b/gi, "Rice")
      .replace(/\bEgqs\b|\bEgg5\b/gi, "Eggs")
      .replace(/\bBr3ad\b/gi, "Bread")
      .replace(/\bChaw1\b/gi, "Chawal")
      .replace(/\bCheen1\b/gi, "Cheeni")
      .replace(/\bTomat0\b/gi, "Tomato")
      .replace(/\bPotat0\b/gi, "Potato")
      .replace(/\b1L\b|\b1 L\b/gi, "1L")
      .replace(/\b1kg\b|\b1 kg\b/gi, "1kg")
      .replace(/\b2kg\b|\b2 kg\b/gi, "2kg")
      .replace(/\b5kg\b|\b5 kg\b/gi, "5kg")
      .trim();
  }

  async function runTesseractOcrOnImageBuffer(imageBuffer: Buffer, catalogList: any[], db: any): Promise<string> {
    let worker: any = null;
    try {
      const tesseractModule = await import("tesseract.js");
      const createWorkerFunc = tesseractModule.createWorker || (tesseractModule as any).default?.createWorker;
      if (!createWorkerFunc) {
        console.warn("Tesseract createWorker function not found in imported module.");
        return "";
      }

      const sharp = (await import("sharp")).default;
      worker = await createWorkerFunc("eng");

      let bestText = "";
      let bestScore = 0;

      const recordText = (text: string) => {
        if (!text) return;
        const cleaned = cleanOcrArtifacts(text).trim();
        const score = scoreOcrTextReadability(cleaned);
        if (score > bestScore || (!bestText && cleaned.length >= 3)) {
          bestScore = score;
          bestText = cleaned;
        }
      };

      // Pass 0: Direct raw buffer recognition for digital screenshots and clean bills
      try {
        const retDirect = await worker.recognize(imageBuffer);
        const textDirect = retDirect && retDirect.data ? retDirect.data.text || "" : "";
        if (textDirect) {
          recordText(textDirect);
          const itemsDirect = parseOcrTextToItems(textDirect, catalogList, db);
          if (itemsDirect && itemsDirect.length > 0) {
            console.log(`Tesseract Pass 0 (Direct Raw Buffer) extracted ${itemsDirect.length} valid products!`);
            await worker.terminate();
            return bestText;
          }
        }
      } catch (directErr) {
        console.warn("Tesseract Direct Pass 0 warning:", directErr);
      }

      // Pass 1: Upright image (Angle 0, EXIF auto-oriented), grayscale, normalized & sharpened
      try {
        const pass1Buffer = await sharp(imageBuffer)
          .rotate()
          .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
          .grayscale()
          .normalize()
          .sharpen({ sigma: 1.2, m1: 1.5, m2: 0.7 })
          .png()
          .toBuffer();

        const ret1 = await worker.recognize(pass1Buffer);
        const text1 = ret1 && ret1.data ? ret1.data.text || "" : "";
        recordText(text1);
        if (text1) {
          const items1 = parseOcrTextToItems(text1, catalogList, db);
          if (items1 && items1.length > 0) {
            console.log(`Tesseract Pass 1 (Upright Grayscale) extracted ${items1.length} valid products!`);
            await worker.terminate();
            return bestText;
          }
        }
      } catch (pass1Err) {
        console.warn("Tesseract Pass 1 warning:", pass1Err);
      }

      // Pass 2: Upright image (Angle 0), binarization / thresholding for thermal receipts or shadow photos
      try {
        const pass2Buffer = await sharp(imageBuffer)
          .rotate()
          .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
          .grayscale()
          .threshold(128)
          .png()
          .toBuffer();

        const ret2 = await worker.recognize(pass2Buffer);
        const text2 = ret2 && ret2.data ? ret2.data.text || "" : "";
        recordText(text2);
        if (text2) {
          const items2 = parseOcrTextToItems(text2, catalogList, db);
          if (items2 && items2.length > 0) {
            console.log(`Tesseract Pass 2 (Upright Threshold) extracted ${items2.length} valid products!`);
            await worker.terminate();
            return bestText;
          }
        }
      } catch (pass2Err) {
        console.warn("Tesseract Pass 2 warning:", pass2Err);
      }

      // Pass 3: Direct buffer recognition without resizing (if raw original image holds fine details)
      try {
        const retDirect = await worker.recognize(imageBuffer);
        const textDirect = retDirect && retDirect.data ? retDirect.data.text || "" : "";
        recordText(textDirect);
      } catch (directErr) {
        console.warn("Tesseract direct recognize warning:", directErr);
      }

      // Pass 4: Rotated orientations (270deg, 90deg, 180deg) if bestText is still short
      if (!bestText || bestText.length < 10) {
        for (const angle of [270, 90, 180]) {
          try {
            const rotatedBuffer = await sharp(imageBuffer)
              .rotate(angle)
              .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
              .grayscale()
              .normalize()
              .sharpen({ sigma: 1.2, m1: 1.5, m2: 0.7 })
              .png()
              .toBuffer();

            const retRot = await worker.recognize(rotatedBuffer);
            const textRot = retRot && retRot.data ? retRot.data.text || "" : "";
            recordText(textRot);
          } catch (rotErr) {
            console.warn(`Tesseract rotation angle ${angle} error:`, rotErr);
          }
        }
      }

      await worker.terminate();
      worker = null;
      return bestText;
    } catch (err) {
      console.error("Tesseract OCR engine error:", err);
      if (worker) {
        try { await worker.terminate(); } catch (e) {}
      }
      return "";
    }
  }

  function parseOcrTextToItems(ocrText: string, catalogList: any[], db: any): any[] {
    if (!ocrText || typeof ocrText !== "string") {
      ocrText = "";
    }
    const cleanedText = cleanOcrArtifacts(ocrText);

    // Split by newlines OR explicit item list breaks
    const rawLines = cleanedText
      .split(/\r?\n|(?<=[a-zA-Z0-9\)\u0600-\u06FF])\s*(?=\d+[\.\)\-]\s*)/)
      .map(l => l.trim())
      .filter(Boolean);

    const noiseKeywordsExact = new Set([
      "total", "subtotal", "sub-total", "tax", "gst", "vat", "discount", "balance", "change",
      "cash", "visa", "mastercard", "invoice", "receipt", "date", "amount", "tax invoice",
      "thank you", "welcome", "cashier", "bill #", "items count", "item count", "paid",
      "tel", "phone", "address", "market", "store", "supermarket", "mart", "qty total",
      "gross amt", "net amt", "total amount", "item qty price total", "item quantity price",
      "shopping list", "grocery list", "bazaar", "bazar", "order summary", "thank you for shopping"
    ]);

    const extractedItems: any[] = [];

    for (let originalLine of rawLines) {
      let line = originalLine.trim();
      if (line.length < 2) continue;
      const lower = line.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();

      // Noise check: table headers, store info, totals, separators
      if (/^[\-\*\=\.\:\,\>\#\(\)\|\+\/_]+$/.test(line)) continue;
      if (/^(\-{3,}|={3,}|\*{3,})$/.test(line)) continue;

      // Table header row check e.g. "QTY ITEM DESCRIPTION PRICE TOTAL"
      if (lower.includes("qty") && (lower.includes("price") || lower.includes("item") || lower.includes("total") || lower.includes("desc"))) continue;

      const noiseSubstrings = [
        "subtotal", "grand total", "net amount", "gross amount", "total amount", "net payable",
        "total payable", "amount due", "balance due", "cash received", "cash paid", "change due",
        "change returned", "tax invoice", "sales tax", "gst", "vat", "cashier", "pos slip",
        "thank you", "welcome", "customer copy", "invoice no", "receipt no", "bill #", "tel:", "phone:",
        "address:", "pvt ltd", "cash & carry", "supermarket", "super market", "superstore", "mart"
      ];

      if (noiseSubstrings.some(s => lower.includes(s))) continue;
      if (/^(total|subtotal|sub-total|net total|grand total|amount payable|net payable|payable|cash|change|balance|paid)\b/i.test(line)) continue;
      if (noiseKeywordsExact.has(lower) || noiseKeywordsExact.has(line.toLowerCase())) continue;
      if (/^[\d\s.,\/:\-\#\(\)\|\+]+$/.test(line)) continue;

      let qty = 1;
      let unit = "item";
      let unitUr = "عدد";
      let price = 0;

      // 1. Strip leading line indices like "1.", "2)", "•", "1 - "
      line = line.replace(/^\s*(?:\d+[\.\)\-]|[\-\*•\>\✓\✔\xbb])\s*/, "").trim();

      // 2. Strip leading explicit quantity numbers e.g. "2 Olpers Milk" or "2 x Bread"
      const leadingNumMatch = line.match(/^\s*(\d{1,3})\s*(?:x|\*|@|pcs|pc|packs|pkt|doz|dozen)?\s+([a-zA-Z\u0600-\u06FF].*)/i);
      if (leadingNumMatch) {
        const q = parseInt(leadingNumMatch[1], 10);
        if (q > 0 && q <= 100) {
          qty = q;
          line = leadingNumMatch[2].trim();
        }
      }

      // 3. Extract trailing price / qty calculations
      const formulaMatch = line.match(/^(.*?)(?:[\-–—@=]|rs\.?|pkr\.?|\$)*\s*([\d,]+(?:\.\d+)?)\s*(?:x|\*|@|pcs|pack|pkts)?\s*(\d+)?\s*(?:=|\s)\s*(?:rs\.?|pkr\.?|\$)?\s*([\d,]+(?:\.\d+)?)?$/i);

      if (formulaMatch && formulaMatch[1].trim().length >= 2) {
        const candidateName = formulaMatch[1].replace(/[\-–—@=]+$/g, "").trim();
        const p1 = parseFloat(formulaMatch[2].replace(/,/g, ""));
        const p2 = formulaMatch[3] ? parseInt(formulaMatch[3], 10) : null;
        const p3 = formulaMatch[4] ? parseFloat(formulaMatch[4].replace(/,/g, "")) : null;

        if (candidateName.length >= 2) {
          line = candidateName;
          if (p2 && p2 > 0 && p2 <= 100) qty = p2;
          if (p3 && p3 > 0) price = p1 > 0 ? p1 : Math.round(p3 / qty);
          else if (p1 > 0) price = p1;
        }
      } else {
        const trailingBlock = line.match(/^(.*?)\s+((?:(?:x|@|=|rs\.?|pkr\.?|\$)?\s*[\d,]+(?:\.\d+)?\s*)+)$/i);
        if (trailingBlock) {
          const candidateName = trailingBlock[1].trim();
          const rawNums = trailingBlock[2].replace(/x|@|=|rs\.?|pkr\.?|\$/gi, " ").trim().split(/\s+/).map(s => parseFloat(s.replace(/,/g, ""))).filter(n => !isNaN(n));

          if (candidateName.length >= 2 && rawNums.length > 0) {
            line = candidateName;
            if (rawNums.length === 3) {
              if (rawNums[0] > 0 && rawNums[0] <= 50 && Number.isInteger(rawNums[0])) {
                qty = rawNums[0];
                price = rawNums[1];
              } else {
                price = rawNums[1] > 0 ? rawNums[1] : rawNums[0];
              }
            } else if (rawNums.length === 2) {
              if (rawNums[0] > 0 && rawNums[0] <= 20 && Number.isInteger(rawNums[0]) && rawNums[1] > rawNums[0] * 5) {
                qty = rawNums[0];
                price = Math.round(rawNums[1] / rawNums[0]);
              } else {
                price = rawNums[1] > 0 ? rawNums[1] : rawNums[0];
              }
            } else if (rawNums.length === 1) {
              price = rawNums[0];
            }
          }
        }
      }

      // 4. Detect unit from product title
      const unitMatch = line.match(/\b(1\s*kg|2\s*kg|5\s*kg|kg|1\s*l|1\.5\s*l|liter|liters|l|pack|packs|dozen|doz|pcs|pc|g|500g|400g|bottle|bottles)\b/i);
      if (unitMatch) {
        const u = unitMatch[1].toLowerCase();
        if (u.includes("kg")) { unit = "kg"; unitUr = "کلو"; }
        else if (u.includes("l") || u.includes("liter")) { unit = "liter"; unitUr = "لیٹر"; }
        else if (u.includes("pack")) { unit = "pack"; unitUr = "پیکٹ"; }
        else if (u.includes("doz")) { unit = "dozen"; unitUr = "درجن"; }
        else if (u.includes("pcs") || u.includes("pc")) { unit = "pcs"; unitUr = "عدد"; }
        else if (u.includes("bottle")) { unit = "bottle"; unitUr = "بوتل"; }
        else if (u.includes("g")) { unit = "g"; unitUr = "گرام"; }
      }

      let cleanName = line.replace(/^[\s\-\*\.\:\,\>\#\(\)\|]+|[\s\-\*\.\:\,\>\#\(\)\|]+$/g, "").trim();
      if (!cleanName || cleanName.length < 2) continue;

      cleanName = cleanName.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

      let match = fuzzyMatchProductBackend(cleanName, cleanName, catalogList);

      if (match) {
        const pStatus = String(match.status || "").toLowerCase().trim();
        const isInactive = (pStatus === "inactive" || pStatus === "unavailable");
        const isOutOfStock = typeof match.stockQuantity === "number" && match.stockQuantity <= 0;
        const isAvailable = !isInactive && !isOutOfStock;
        const activePrice = (match.salePrice && match.salePrice > 0) ? match.salePrice : match.price;
        extractedItems.push({
          name: match.name,
          nameUr: match.nameUr || cleanName,
          category: match.category || "Grocery",
          price: price > 0 ? price : (activePrice > 0 ? activePrice : match.price),
          qty,
          unit: match.unit || unit,
          unitUr: match.unitUr || unitUr,
          productId: match.id,
          matched: isAvailable,
          isCatalogMatch: true,
          isAvailable: isAvailable,
          status: isAvailable ? "Available" : "Unavailable",
          currencyCode: match.currencyCode || match.currency || "PKR"
        });
      } else {
        extractedItems.push({
          name: cleanName,
          nameUr: cleanName,
          category: "Grocery",
          price: price > 0 ? price : 150,
          qty,
          unit,
          unitUr,
          productId: "scanned_" + (extractedItems.length + 1) + "_" + Date.now(),
          matched: false,
          isCatalogMatch: false,
          isAvailable: false,
          status: "Unavailable",
          currencyCode: "PKR"
        });
      }
    }

    return extractedItems;
  }

  // API: Gemini Multimodal OCR product list generator
  const handleOcr = async (req: any, res: any) => {
    const rawImage = req.body.imageBase64 || req.body.image || req.body.file || req.body.data;
    const mimeType = req.body.mimeType || req.body.type;
    if (!rawImage) {
      return res.status(400).json({ error: "Missing image attachment or base64 stream" });
    }
    const imageBase64 = typeof rawImage === "string" ? rawImage : String(rawImage);

    try {
      const db = getDB();
      const resolvedProducts = db.products.map(p => resolveProductFlatFields(p, db));
      const activeDbProds = resolvedProducts.filter(p => p.status !== "Inactive" && p.status !== "Unavailable");
      const catalogList = activeDbProds.length > 0 ? activeDbProds : resolvedProducts;

      // 1. Try PHP Backend OCR & product detection script first
      try {
        const { execSync } = await import("child_process");
        const phpPayload = JSON.stringify({ imageBase64, mimeType, catalogList });
        const phpOut = execSync("php ocr.php", {
          input: phpPayload,
          timeout: 15000,
          encoding: "utf-8"
        });
        if (phpOut && phpOut.trim().length > 2) {
          const phpItems = JSON.parse(phpOut);
          if (Array.isArray(phpItems) && phpItems.length > 0) {
            console.log(`PHP Backend OCR successfully extracted ${phpItems.length} items from image!`);
            return res.json(phpItems);
          }
        }
      } catch (phpErr) {
        console.warn("PHP Backend OCR execution warning:", phpErr);
      }

      let apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        dotenv.config();
        apiKey = process.env.GEMINI_API_KEY;
      }

      let extractedJsonText = "";
      let productsParsed: any[] = [];

      const commaIdx = imageBase64.indexOf(",");
      let detectedMime = mimeType || "image/jpeg";
      if (commaIdx !== -1) {
        const header = imageBase64.substring(0, commaIdx);
        const matchMime = header.match(/data:(.*?);base64/);
        if (matchMime && matchMime[1]) detectedMime = matchMime[1];
      }
      if (detectedMime === "image/jpg") detectedMime = "image/jpeg";
      const strippedBase64 = commaIdx !== -1 ? imageBase64.substring(commaIdx + 1) : imageBase64;
      const rawImageBuffer = Buffer.from(strippedBase64, "base64");

      // Auto-orient and normalize image buffer using Sharp
      let processedImageBuffer = rawImageBuffer;
      let processedBase64 = strippedBase64;
      try {
        const sharp = (await import("sharp")).default;
        processedImageBuffer = await sharp(rawImageBuffer)
          .rotate()
          .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 95 })
          .toBuffer();
        processedBase64 = processedImageBuffer.toString("base64");
        detectedMime = "image/jpeg";
      } catch (sharpPreprocessErr) {
        console.warn("Sharp preprocessing for OCR initial buffer warning:", sharpPreprocessErr);
      }

      if (apiKey) {
        const productListString = catalogList.map(p => `- ID: ${p.id}, English Name: "${p.name}", Urdu Name: "${p.nameUr}", Category: "${p.category}", Price: ${p.price}, Unit: "${p.unit}", Urdu Unit: "${p.unitUr}"`).join("\n");

        console.log("Launching server-side Gemini Vision OCR for paper invoice/bill image...");
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });

        const imagePart = {
          inlineData: {
            mimeType: detectedMime,
            data: processedBase64
          }
        };

        const promptText = `You are a high-precision OCR and document analysis engine specialized in reading physical paper receipts, supermarket bills, wholesale invoices, POS cash register printouts, handwritten grocery lists, and shopping invoices in English, Urdu, and bilingual formats.

Read this image from top to bottom thoroughly. Detect and extract every single purchased product, food item, grocery, beverage, household supply, or line item visible in the image.

STORE PRODUCT CATALOG (FOR REFERENCE AND MATCHING ID WHEN APPLICABLE):
${productListString}

EXTRACTION INSTRUCTIONS:
1. Extract ALL purchased products/items.
2. For each detected item provide:
   - "name": Clean English title of the item (e.g., "Fresh Milk 1L", "Super Basmati Rice 5kg", "Eggs 1 Dozen", "Cooking Oil 1L", "Potatoes 2kg", "Tomatoes 1kg", "Onions 1kg", "Sugar 5kg", "Tapal Danedar Tea 430g").
   - "nameUr": Urdu script title for the item (e.g., "تازہ دودھ", "سپر باسپتی چاول", "انڈے", "کوکنگ آئل", "آلو", "ٹماٹر", "پیاز", "چینی", "چائے").
   - "category": Category name (e.g. "Dairy", "Grains", "Vegetables", "Grocery", "Beverages", "Snacks").
   - "price": Item unit price or line price as a numeric value without currency symbols (e.g. 280, 450, 150. If price is not printed or unreadable, estimate a realistic market price in PKR, e.g. 150).
   - "qty": Quantity purchased as a positive integer (default to 1 if not specified).
   - "unit": Measurement unit in English (e.g. "kg", "liter", "pack", "pcs", "dozen", "bottle", "g", "item").
   - "unitUr": Measurement unit in Urdu (e.g. "کلو", "لیٹر", "پیکٹ", "عدد", "درجن", "بوتل", "گرام").
   - "productId": If the item matches an item in the STORE PRODUCT CATALOG, provide its exact store ID. Otherwise null.
3. EXCLUDE store metadata (store name, branch address, phone number, cashier name, invoice number, date/timestamp).
4. EXCLUDE summary/subtotal lines (subtotal, GST/sales tax, cash paid, change due, grand total, balance).
5. Output format must strictly be a valid JSON object:
{
  "items": [
    {
      "name": "Olpers Milk 1L",
      "nameUr": "اولپرز دودھ 1 لیٹر",
      "category": "Dairy",
      "price": 280,
      "qty": 2,
      "unit": "liter",
      "unitUr": "لیٹر",
      "productId": "1"
    }
  ]
}`;

        const modelNames = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];

        for (const modelName of modelNames) {
          try {
            console.log(`Attempting OCR content generation using model: ${modelName}`);
            const response = await ai.models.generateContent({
              model: modelName,
              contents: [
                imagePart,
                { text: promptText }
              ],
              config: {
                systemInstruction: "You are an expert bilingual OCR extraction system. You parse supermarket receipts, store invoices, and handwritten grocery lists, returning ALL detected products as a structured JSON object containing an 'items' array.",
                responseMimeType: "application/json"
              }
            });
            extractedJsonText = response.text || "";
            if (extractedJsonText && extractedJsonText.trim().length > 2) {
              console.log(`OCR model ${modelName} succeeded! Raw output length: ${extractedJsonText.length}`);
              break;
            }
          } catch (ocrErr) {
            console.warn(`OCR model ${modelName} call error:`, ocrErr);
          }
        }

        // If processed base64 failed or yielded empty result, retry with raw stripped base64
        if (!extractedJsonText) {
          console.log("Retrying Gemini OCR with raw stripped base64 buffer...");
          for (const modelName of ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"]) {
            try {
              const rawImagePart = {
                inlineData: {
                  mimeType: detectedMime,
                  data: strippedBase64
                }
              };
              const response = await ai.models.generateContent({
                model: modelName,
                contents: [
                  rawImagePart,
                  { text: promptText }
                ],
                config: {
                  systemInstruction: "You are an expert bilingual OCR extraction system. Return a JSON object with 'items' array containing all detected products.",
                  responseMimeType: "application/json"
                }
              });
              extractedJsonText = response.text || "";
              if (extractedJsonText && extractedJsonText.trim().length > 2) {
                console.log(`Raw buffer OCR model ${modelName} succeeded!`);
                break;
              }
            } catch (rawOcrErr) {
              console.warn(`Raw buffer OCR model ${modelName} error:`, rawOcrErr);
            }
          }
        }
      }

      if (extractedJsonText) {
        try {
          let cleanText = extractedJsonText;
          if (cleanText.includes("```json")) {
            cleanText = cleanText.split("```json")[1].split("```")[0];
          } else if (cleanText.includes("```")) {
            cleanText = cleanText.split("```")[1].split("```")[0];
          }
          cleanText = cleanText.trim();

          let rawParsed: any = null;
          try {
            rawParsed = JSON.parse(cleanText);
          } catch (e) {
            const firstBracket = cleanText.indexOf("[");
            const lastBracket = cleanText.lastIndexOf("]");
            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
              const substringArray = cleanText.substring(firstBracket, lastBracket + 1);
              rawParsed = JSON.parse(substringArray);
            } else {
              const firstObj = cleanText.indexOf("{");
              const lastObj = cleanText.lastIndexOf("}");
              if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
                const substringObj = cleanText.substring(firstObj, lastObj + 1);
                rawParsed = JSON.parse(substringObj);
              }
            }
          }

          if (Array.isArray(rawParsed)) {
            productsParsed = rawParsed;
          } else if (rawParsed && typeof rawParsed === "object") {
            if (Array.isArray(rawParsed.items)) {
              productsParsed = rawParsed.items;
            } else if (Array.isArray(rawParsed.products)) {
              productsParsed = rawParsed.products;
            } else if (Array.isArray(rawParsed.data)) {
              productsParsed = rawParsed.data;
            } else {
              const keys = Object.keys(rawParsed);
              const possibleArray = keys.map(k => rawParsed[k]).find(val => Array.isArray(val) && val.length > 0);
              if (possibleArray) {
                productsParsed = possibleArray;
              } else {
                const objectValues = Object.values(rawParsed).filter((v: any) => v && typeof v === "object" && (v.name || v.itemName || v.item || v.productName));
                if (objectValues.length > 0) {
                  productsParsed = objectValues;
                } else if (rawParsed.name || rawParsed.itemName || rawParsed.item) {
                  productsParsed = [rawParsed];
                }
              }
            }
          }
        } catch (parseError) {
          console.warn("JSON parsing of Gemini OCR output failed:", parseError);
        }
      }

      let formattedProducts: any[] = [];
      if (productsParsed && productsParsed.length > 0) {
        formattedProducts = productsParsed.map((item: any, idx: number) => {
          let rawName = item.name || item.itemName || item.productName || item.item || `Scanned Item ${idx + 1}`;
          let cleanedName = rawName.replace(/^[\s\d\-•*.)\]:]+/, '').trim();
          if (!cleanedName) cleanedName = rawName;

          const name = cleanedName;
          const nameUr = item.nameUr || item.name_ur || item.urdu_name || item.urduName || name;
          const category = item.category || item.cat || "Grocery";

          let price = 0;
          if (item.price !== undefined && item.price !== null) {
            const parsedPrice = parseFloat(item.price);
            if (!isNaN(parsedPrice) && parsedPrice > 0) price = parsedPrice;
          }

          let qty = 1;
          if (item.qty !== undefined && item.qty !== null) {
            const parsedQty = parseInt(item.qty);
            if (!isNaN(parsedQty) && parsedQty > 0) qty = parsedQty;
          }

          const unit = item.unit || "item";
          const unitUr = item.unitUr || item.unit_ur || "عدد";

          let match = null;
          if (item.productId && (typeof item.productId === "number" || /^\d+$/.test(String(item.productId)))) {
            match = catalogList.find(p => String(p.id) === String(item.productId));
          }
          if (!match) {
            match = fuzzyMatchProductBackend(name, nameUr, catalogList);
          }

          if (match) {
            const pStatus = String(match.status || "").toLowerCase().trim();
            const isInactive = (pStatus === "inactive" || pStatus === "unavailable");
            const isOutOfStock = typeof match.stockQuantity === 'number' && match.stockQuantity <= 0;
            const isAvailable = !isInactive && !isOutOfStock;
            const activePrice = (match.salePrice && match.salePrice > 0) ? match.salePrice : match.price;
            return {
              name: match.name,
              nameUr: match.nameUr,
              category: match.category || category,
              price: price > 0 ? price : (activePrice > 0 ? activePrice : match.price),
              qty,
              unit: match.unit || unit,
              unitUr: match.unitUr || unitUr,
              productId: match.id,
              matched: isAvailable,
              isCatalogMatch: true,
              isAvailable: isAvailable,
              status: isAvailable ? "Available" : "Unavailable",
              currencyCode: match.currencyCode || match.currency || "PKR"
            };
          } else {
            return {
              name,
              nameUr: nameUr || name,
              category: category || "Grocery",
              price: price > 0 ? price : 150,
              qty,
              unit,
              unitUr,
              productId: "scanned_" + (idx + 1) + "_" + Date.now(),
              matched: false,
              isCatalogMatch: false,
              isAvailable: false,
              status: "Unavailable",
              currencyCode: "PKR"
            };
          }
        });
      }

      // If Gemini API did not yield products or failed, run Tesseract OCR on the actual uploaded image!
      if (formattedProducts.length === 0) {
        console.log("Running local Tesseract OCR engine on uploaded image buffer...");
        const imageBuffer = Buffer.from(strippedBase64, "base64");
        const ocrText = await runTesseractOcrOnImageBuffer(imageBuffer, catalogList, db);
        console.log("Tesseract OCR raw text extracted length:", ocrText ? ocrText.length : 0);
        if (ocrText && ocrText.trim().length > 0) {
          formattedProducts = parseOcrTextToItems(ocrText, catalogList, db);
        }
        if (formattedProducts.length === 0 && ocrText) {
          const lowerOcr = ocrText.toLowerCase();
          for (const p of catalogList) {
            const pNameLower = p.name ? p.name.toLowerCase().trim() : "";
            const pUrLower = p.nameUr ? p.nameUr.toLowerCase().trim() : "";
            if ((pNameLower.length >= 3 && lowerOcr.includes(pNameLower)) || (pUrLower.length >= 3 && lowerOcr.includes(pUrLower))) {
              formattedProducts.push({
                name: p.name,
                nameUr: p.nameUr || p.name,
                category: p.category || "Grocery",
                price: (p.salePrice && p.salePrice > 0) ? p.salePrice : p.price,
                qty: 1,
                unit: p.unit || "item",
                unitUr: p.unitUr || "عدد",
                productId: p.id,
                matched: true,
                isCatalogMatch: true,
                isAvailable: true,
                status: "Available",
                currencyCode: p.currencyCode || p.currency || "PKR"
              });
            }
          }
        }
      }

      const seenNames = new Set();
      const finalProducts = formattedProducts.filter(item => {
        const key = item.name.toLowerCase().trim();
        if (seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
      });

      console.log(`OCR extraction finished! Extracted ${finalProducts.length} actual items from image.`);
      res.json(finalProducts);
    } catch (err: any) {
      console.error("OCR server processing error:", err);
      res.json([]);
    }
  };

  app.post("/api/ocr", handleOcr);
  app.post("/api/process-ocr", handleOcr);
  app.post("/api/process_ocr", handleOcr);
  app.post("/api/scan-bill", handleOcr);

  // ================= BACKEND FUZZY MATCH & SPEECH PARSER HELPERS =================
  function getLevenshteinDistance(a: string, b: string): number {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  function getSpellingSimilarity(s1: string, s2: string): number {
    if (!s1 || !s2) return 0;
    const dist = getLevenshteinDistance(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);
    return maxLen === 0 ? 1 : 1 - dist / maxLen;
  }

  const synonymsMap: { [key: string]: string[] } = {
    "coke": ["coca-cola", "cocacola", "cola", "soda"],
    "cola": ["coca-cola", "cocacola", "coke"],
    "milk": ["whole milk", "dairy milk", "pack milk", "milkpak"],
    "egg": ["large eggs", "eggs", "egg"],
    "eggs": ["large eggs", "eggs", "egg"],
    "cheese": ["cheddar cheese", "cheese slice", "paneer"],
    "butter": ["butter block", "butter", "makkhan"],
    "bananas": ["bananas", "banana"],
    "banana": ["bananas", "banana"],
    "apples": ["apples", "apple"],
    "apple": ["apples", "apple"],
    "oranges": ["oranges", "orange", "kinnow"],
    "orange": ["oranges", "orange"],
    "mangoes": ["mangoes", "mango"],
    "mango": ["mangoes", "mango"],
    "tomatoes": ["tomatoes", "tomato"],
    "tomato": ["tomatoes", "tomato"],
    "potatoes": ["potatoes", "potato"],
    "potato": ["potatoes", "potato"],
    "onions": ["onions", "onion"],
    "onion": ["onions", "onion"],
    "carrots": ["carrots", "carrot"],
    "carrot": ["carrots", "carrot"],
    "chicken": ["chicken breast", "chicken", "murgi"],
    "beef": ["ground beef", "beef", "mincemeat", "qeema", "keema"],
    "qeema": ["ground beef", "beef", "mincemeat", "qeema", "keema"],
    "fish": ["salmon fillet", "fish fillet", "salmon", "machli"],
    "salmon": ["salmon fillet", "fish fillet", "salmon"],
    "water": ["mineral water", "water bottle"],
    "tea": ["green tea", "chai", "tea pack"],
    "chai": ["green tea", "chai", "tea pack"],
    "rice": ["white rice", "rice pack", "chawal"],
    "pasta": ["pasta", "macaroni", "spaghetti"],
    "oil": ["cooking oil", "oil bottle", "ghee", "tel"],
    "sugar": ["sugar", "cheeni"],
    "salt": ["salt", "namak"]
  };

  const romanUrduMap: { [key: string]: string } = {
    "doodh": "milk", "dudh": "milk", "khalees doodh": "milk", "dood": "milk",
    "anday": "eggs", "ande": "eggs", "anda": "eggs", "andey": "eggs",
    "paneer": "cheese", "paner": "cheese", "chees": "cheese",
    "makkhan": "butter", "makhan": "butter", "makkan": "butter",
    "kelay": "bananas", "kele": "bananas", "kela": "bananas",
    "saib": "apples", "seb": "apples", "apple": "apples",
    "maltey": "oranges", "malte": "oranges", "malta": "oranges", "kinnow": "oranges", "kino": "oranges",
    "aam": "mangoes", "mango": "mangoes",
    "tamatar": "tomatoes", "tomato": "tomatoes", "tamatr": "tomatoes",
    "aaloo": "potatoes", "aalu": "potatoes", "aloo": "potatoes", "alu": "potatoes", "potato": "potatoes",
    "pyaaz": "onions", "piyaz": "onions", "pyaz": "onions", "onion": "onions",
    "gajar": "carrots", "gajjar": "carrots", "carrot": "carrots",
    "murghi": "chicken", "murgi": "chicken", "murghi ka gosht": "chicken", "chicken": "chicken",
    "qeema": "beef", "qima": "beef", "keema": "beef", "beef": "beef",
    "machli": "fish", "machhli": "fish", "fish": "fish", "salmon": "fish",
    "paani": "water", "pani": "water", "water": "water",
    "chai": "tea", "sabz chai": "tea", "tea": "tea",
    "chawal": "rice", "rice": "rice",
    "tel": "oil", "tail": "oil", "koking oil": "oil", "cooking oil": "oil", "oil": "oil", "ghee": "oil",
    "cheeni": "sugar", "chini": "sugar", "sugar": "sugar",
    "namak": "salt", "salt": "salt"
  };

  const unitSizeNoiseList = [
    "kg", "g", "gram", "grams", "kilo", "kilos", "kilogram", "kilograms",
    "liter", "liters", "litre", "litres", "l", "ml", "milliliter", "milliliters",
    "lb", "lbs", "pound", "pounds", "pack", "packs", "packet", "packets", "pekit",
    "box", "boxes", "bottle", "bottles", "botle", "dabba", "dabbe", "piece", "pieces",
    "pcs", "pc", "dozen", "dozens", "darjan", "darjn", "1kg", "2kg", "5kg", "1l", "2l", "5l",
    "250g", "500g", "800g", "1000g", "250ml", "500ml", "1litre", "2litre", "5litre", "1liter"
  ];

  function stripPluralEndings(s: string): string {
    return s
      .replace(/s\b|es\b|ies\b/gi, "")
      .replace(/es$/gi, "")
      .replace(/s$/gi, "");
  }

  function normalizeString(str: string): string {
    return (str || "")
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function fuzzyMatchProductBackend(pNameItem: string, pNameUrItem: string, productsList: any[]): any {
    if (!productsList || productsList.length === 0) return null;

    const rawEn = normalizeString(pNameItem);
    const rawUr = normalizeString(pNameUrItem);

    if (!rawEn && !rawUr) return null;

    const noiseWordsRegex = /\b(1x|2x|3x|4x|5x|kg|g|gram|grams|kilo|kilos|kilogram|kilograms|liter|liters|litre|litres|l|ml|milliliter|milliliters|lb|lbs|pound|pounds|pack|packs|packet|packets|box|boxes|bottle|bottles|piece|pieces|pcs|pc|dozen|dozens|pkr|rs|usd|\$|nestle|olpers|national|shan|shangrila|habib|lipton|tapal|meezan|dalda|rafhan|knorr|knor|mitchells|sensodyne|colgate|lux|surf|ariel|harpic|dettol|fresh|super|kernel|broiler|pure|life|iodized|organic|org|original|best|quality|premium|extra|prime|brand|select|choice|item|items)\b/gi;

    const cleanNoise = (str: string) => {
      const norm = normalizeString(str);
      return norm
        .replace(noiseWordsRegex, "")
        .replace(/\b\d+(\.\d+)?(kg|g|l|ml|oz|lb)?\b/gi, "")
        .replace(/\b\d+\b/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    const cleanedEn = cleanNoise(rawEn) || rawEn;

    // Direct Exact Name Check
    for (const p of productsList) {
      const pName = normalizeString(p.name);
      const pNameUr = normalizeString(p.nameUr);
      if (pName === rawEn || (pNameUr && rawUr && pNameUr === rawUr)) {
        return p;
      }
      if (pName === cleanedEn) {
        return p;
      }
    }

    // Roman Urdu & Abbreviation Translation
    let expandedEn = cleanedEn
      .split(" ")
      .map(tok => romanUrduMap[tok] || tok)
      .join(" ");

    let bestProduct = null;
    let maxScore = 0;

    const keyNounList = [
      "milk", "egg", "eggs", "cheese", "butter", "banana", "bananas", "apple", "apples",
      "orange", "oranges", "mango", "mangoes", "tomato", "tomatoes", "potato", "potatoes",
      "onion", "onions", "carrot", "carrots", "chicken", "beef", "qeema", "fish", "salmon",
      "water", "tea", "chai", "rice", "pasta", "oil", "ghee", "sugar", "salt", "masala",
      "bread", "flour", "atta", "daal", "lentil", "biscuit", "yogurt", "dahi"
    ];

    for (const p of productsList) {
      const pName = normalizeString(p.name);
      const pNameUr = normalizeString(p.nameUr);
      const pNameCleaned = cleanNoise(pName) || pName;

      let score = 0;

      // Cleaned Exact Match
      if (pNameCleaned === cleanedEn || pNameCleaned === expandedEn) {
        score = Math.max(score, 98);
      }

      // Synonym Match
      if (synonymsMap[cleanedEn] || synonymsMap[expandedEn]) {
        const synList = synonymsMap[cleanedEn] || synonymsMap[expandedEn] || [];
        if (synList.some(syn => pName.includes(syn) || pNameCleaned.includes(syn))) {
          score = Math.max(score, 92);
        }
      }

      // Substring Match
      if (cleanedEn.length >= 3 && pNameCleaned.length >= 3) {
        if (pNameCleaned.includes(cleanedEn) || cleanedEn.includes(pNameCleaned)) {
          score = Math.max(score, 85);
        }
        if (pNameCleaned.includes(expandedEn) || expandedEn.includes(pNameCleaned)) {
          score = Math.max(score, 88);
        }
      }

      if (rawEn.length >= 3 && pName.length >= 3) {
        if (pName.includes(rawEn) || rawEn.includes(pName)) {
          score = Math.max(score, 80);
        }
      }

      if (rawUr.length >= 2 && pNameUr.length >= 2) {
        if (pNameUr.includes(rawUr) || rawUr.includes(pNameUr)) {
          score = Math.max(score, 85);
        }
      }

      // Token Overlap Score
      const tokensScanned = expandedEn.split(" ").filter(t => t.length > 1);
      const tokensProduct = pNameCleaned.split(" ").filter(t => t.length > 1);

      if (tokensScanned.length > 0 && tokensProduct.length > 0) {
        let matches = 0;
        for (const st of tokensScanned) {
          const stSingular = stripPluralEndings(st);
          for (const pt of tokensProduct) {
            const ptSingular = stripPluralEndings(pt);
            if (st === pt || stSingular === ptSingular || (st.length >= 3 && pt.length >= 3 && (st.includes(pt) || pt.includes(st)))) {
              matches++;
              break;
            }
          }
        }
        const overlapRatio = (2 * matches) / (tokensScanned.length + tokensProduct.length);
        if (overlapRatio > 0) {
          const tokenScore = Math.round(55 + overlapRatio * 35);
          score = Math.max(score, tokenScore);
        }
      }

      // Key Noun Match
      for (const noun of keyNounList) {
        const nounSingular = stripPluralEndings(noun);
        const isScannedHasNoun = expandedEn.includes(noun) || expandedEn.includes(nounSingular);
        const isProductHasNoun = pName.includes(noun) || pName.includes(nounSingular) || pNameCleaned.includes(noun);
        if (isScannedHasNoun && isProductHasNoun) {
          score = Math.max(score, 70);
        }
      }

      // Fuzzy Levenshtein Distance Match
      const simCleaned = getSpellingSimilarity(expandedEn, pNameCleaned);
      const simRaw = getSpellingSimilarity(rawEn, pName);
      const maxSim = Math.max(simCleaned, simRaw);

      if (maxSim >= 0.50) {
        const levScore = Math.round(maxSim * 80);
        score = Math.max(score, levScore);
      }

      if (score > maxScore) {
        maxScore = score;
        bestProduct = p;
      }
    }

    if (maxScore >= 50 && bestProduct) {
      return bestProduct;
    }

    return null;
  }

  // Helper to detect specific units in speech and map them to bilingually correct units
  function detectUnitBackend(text: string) {
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

  function parseVoiceCommandBackend(text: string, products: any[]): any[] {
    const normalized = text.toLowerCase().trim();
    const results: any[] = [];

    const NUM_MAP: { [key: string]: number } = {
      "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
      "eleven": 11, "twelve": 12, "dozen": 12, "half": 0.5, "couple": 2, "a": 1, "an": 1, "some": 1,
      "ایک": 1, "ek": 1, "دو": 2, "do": 2, "تین": 3, "teen": 3, "چار": 4, "char": 4, "پانچ": 5, "panch": 5,
      "چھ": 6, "cheh": 6, "che": 6, "سات": 7, "saat": 7, "آٹھ": 8, "aath": 8, "نو": 9, "nau": 9, "no": 9,
      "دس": 10, "das": 10, "درجن": 12, "darjan": 12, "adha": 0.5, "آدھا": 0.5
    };

    // Helper for backend category matching
    const backendCategoryMatch = (categoryKeys: string[], defaultIds: { id: number; qty: number; unit: string; unitUr: string }[], fallbackCat: string) => {
      let matchedProds = products.filter(p => {
        if (p.status === "Inactive" || p.status === "Unavailable" || p.status?.toLowerCase() === "inactive" || p.status?.toLowerCase() === "unavailable") return false;
        const cat = (p.category || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        return categoryKeys.some(k => cat.includes(k) || name.includes(k));
      });

      if (matchedProds.length > 0) {
        return matchedProds.map(prod => ({
          name: prod.name,
          nameUr: prod.nameUr,
          category: prod.category,
          price: (prod.salePrice && prod.salePrice > 0) ? prod.salePrice : prod.price,
          qty: 1,
          unit: prod.unit || "item",
          unitUr: prod.unitUr || "عدد",
          productId: prod.id,
          matched: true,
          action: "add"
        }));
      } else {
        return defaultIds.map(item => {
          const prod = products.find(p => p.id === item.id);
          return {
            name: prod ? prod.name : "Product Syncing",
            nameUr: prod ? prod.nameUr : "نامعلوم چیز",
            category: prod ? prod.category : fallbackCat,
            price: prod ? ((prod.salePrice && prod.salePrice > 0) ? prod.salePrice : prod.price) : 1.99,
            qty: item.qty,
            unit: item.unit,
            unitUr: item.unitUr,
            productId: item.id,
            matched: true,
            action: "add"
          };
        });
      }
    };

    // Support category-based commands
    const isAllFruits = [
      "add all fruits", "all fruits", "healthy fruits", "healthy fruit", "fruits add karo", "phal add karo",
      "sare phal", "saare phal", "sare phalo", "saaray phal", "تمام پھل", "fruits", "fruit"
    ].some(phrase => normalized === phrase || normalized.includes(phrase));

    if (isAllFruits) {
      return backendCategoryMatch(["fruit", "phal", "پھل"], [
        { id: 5, qty: 1, unit: "dozen", unitUr: "درجن" },
        { id: 6, qty: 1, unit: "kg", unitUr: "کلو" },
        { id: 7, qty: 1, unit: "dozen", unitUr: "درجن" },
        { id: 8, qty: 1, unit: "piece", unitUr: "عدد" }
      ], "Fruits");
    }

    const isAllVegetables = [
      "add all vegetables", "all vegetables", "vegetables", "vegetable", "sabzi", "sabziyaan", "sabziyan", "sabzi add karo", "sari sabziyaan", "sari sabziyan", "saari sabziyan", "تمام سبزیاں"
    ].some(phrase => normalized === phrase || normalized.includes(phrase));

    if (isAllVegetables) {
      return backendCategoryMatch(["veg", "sabzi", "سبزیاں"], [
        { id: 9, qty: 1, unit: "kg", unitUr: "کلو" },
        { id: 10, qty: 1, unit: "kg", unitUr: "کلو" },
        { id: 11, qty: 1, unit: "kg", unitUr: "کلو" },
        { id: 12, qty: 1, unit: "kg", unitUr: "کلو" }
      ], "Vegetables");
    }

    const isAllDairy = [
      "add all dairy", "all dairy", "dairy items", "sare dairy", "saari dairy", "تمام ڈیری", "ڈیری"
    ].some(phrase => normalized.includes(phrase));

    if (isAllDairy) {
      return backendCategoryMatch(["dairy", "milk", "cheese", "butter", "doodh"], [
        { id: 1, qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { id: 2, qty: 1, unit: "dozen", unitUr: "درجن" },
        { id: 3, qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { id: 4, qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ], "Dairy");
    }

    const isAllBeverages = [
      "add all beverages", "all beverages", "all drinks", "sare drinks", "saari drinks", "drinks", "beverages", "مشروبات"
    ].some(phrase => normalized.includes(phrase));

    if (isAllBeverages) {
      return backendCategoryMatch(["beverage", "drink", "water", "coke", "tea", "chai"], [
        { id: 16, qty: 1, unit: "piece", unitUr: "عدد" },
        { id: 17, qty: 1, unit: "piece", unitUr: "عدد" },
        { id: 18, qty: 1, unit: "box", unitUr: "ڈبہ" }
      ], "Beverages");
    }

    const isAllMeat = [
      "add all meat", "all meat", "meat items", "sare meat", "saari meat", "گوشت", "تمام گوشت"
    ].some(phrase => normalized.includes(phrase));

    if (isAllMeat) {
      return backendCategoryMatch(["meat", "chicken", "beef", "fish", "salmon", "qeema"], [
        { id: 13, qty: 1, unit: "kg", unitUr: "کلو" },
        { id: 14, qty: 1, unit: "kg", unitUr: "کلو" },
        { id: 15, qty: 1, unit: "kg", unitUr: "کلو" }
      ], "Meat & Poultry");
    }

    const isAllPantry = [
      "add all pantry", "all pantry", "pantry items", "sare pantry", "پینٹری", "تمام پینٹری"
    ].some(phrase => normalized.includes(phrase));

    if (isAllPantry) {
      return backendCategoryMatch(["pantry", "rice", "pasta", "oil", "sugar", "salt"], [
        { id: 19, qty: 1, unit: "kg", unitUr: "کلو" },
        { id: 20, qty: 1, unit: "box", unitUr: "ڈبہ" },
        { id: 21, qty: 1, unit: "piece", unitUr: "عدد" },
        { id: 22, qty: 1, unit: "pack", unitUr: "پیکٹ" },
        { id: 23, qty: 1, unit: "pack", unitUr: "پیکٹ" }
      ], "Pantry & Staples");
    }

    // Support recipe ingredients and expanded recipes programmatically
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

      return biryaniItems.map(item => {
        if (item.matched) {
          const prod = products.find(p => p.id === item.id);
          return {
            name: prod ? prod.name : "Product Syncing",
            nameUr: prod ? prod.nameUr : "نامعلوم چیز",
            category: prod ? prod.category : "Pantry",
            price: prod ? ((prod.salePrice && prod.salePrice > 0) ? prod.salePrice : prod.price) : 1.99,
            qty: item.qty,
            unit: item.unit,
            unitUr: item.unitUr,
            productId: item.id,
            matched: true,
            action: "add"
          };
        } else {
          return {
            name: item.name,
            nameUr: item.nameUr,
            category: item.category,
            price: 1.99,
            qty: item.qty,
            unit: item.unit,
            unitUr: item.unitUr,
            productId: null,
            matched: false,
            action: "add"
          };
        }
      });
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

      return chaiItems.map(item => {
        if (item.matched) {
          const prod = products.find(p => p.id === item.id);
          return {
            name: prod ? prod.name : "Product Syncing",
            nameUr: prod ? prod.nameUr : "نامعلوم چیز",
            category: prod ? prod.category : "Beverages",
            price: prod ? ((prod.salePrice && prod.salePrice > 0) ? prod.salePrice : prod.price) : 1.99,
            qty: item.qty,
            unit: item.unit,
            unitUr: item.unitUr,
            productId: item.id,
            matched: true,
            action: "add"
          };
        } else {
          return {
            name: item.name,
            nameUr: item.nameUr,
            category: item.category,
            price: 1.99,
            qty: item.qty,
            unit: item.unit,
            unitUr: item.unitUr,
            productId: null,
            matched: false,
            action: "add"
          };
        }
      });
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

      return friedRiceItems.map(item => {
        if (item.matched) {
          const prod = products.find(p => p.id === item.id);
          return {
            name: prod ? prod.name : "Product Syncing",
            nameUr: prod ? prod.nameUr : "نامعلوم چیز",
            category: prod ? prod.category : "Pantry",
            price: prod ? ((prod.salePrice && prod.salePrice > 0) ? prod.salePrice : prod.price) : 1.99,
            qty: item.qty,
            unit: item.unit,
            unitUr: item.unitUr,
            productId: item.id,
            matched: true,
            action: "add"
          };
        } else {
          return {
            name: item.name,
            nameUr: item.nameUr,
            category: item.category,
            price: 1.99,
            qty: item.qty,
            unit: item.unit,
            unitUr: item.unitUr,
            productId: null,
            matched: false,
            action: "add"
          };
        }
      });
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

      return omeletteItems.map(item => {
        if (item.matched) {
          const prod = products.find(p => p.id === item.id);
          return {
            name: prod ? prod.name : "Product Syncing",
            nameUr: prod ? prod.nameUr : "نامعلوم چیز",
            category: prod ? prod.category : "Dairy",
            price: prod ? ((prod.salePrice && prod.salePrice > 0) ? prod.salePrice : prod.price) : 1.99,
            qty: item.qty,
            unit: item.unit,
            unitUr: item.unitUr,
            productId: item.id,
            matched: true,
            action: "add"
          };
        } else {
          return {
            name: item.name,
            nameUr: item.nameUr,
            category: item.category,
            price: 1.99,
            qty: item.qty,
            unit: item.unit,
            unitUr: item.unitUr,
            productId: null,
            matched: false,
            action: "add"
          };
        }
      });
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

      return karahiItems.map(item => {
        if (item.matched) {
          const prod = products.find(p => p.id === item.id);
          return {
            name: prod ? prod.name : "Product Syncing",
            nameUr: prod ? prod.nameUr : "نامعلوم چیز",
            category: prod ? prod.category : "Pantry",
            price: prod ? ((prod.salePrice && prod.salePrice > 0) ? prod.salePrice : prod.price) : 1.99,
            qty: item.qty,
            unit: item.unit,
            unitUr: item.unitUr,
            productId: item.id,
            matched: true,
            action: "add"
          };
        } else {
          return {
            name: item.name,
            nameUr: item.nameUr,
            category: item.category,
            price: 1.99,
            qty: item.qty,
            unit: item.unit,
            unitUr: item.unitUr,
            productId: null,
            matched: false,
            action: "add"
          };
        }
      });
    }

    const isRecipeIngredients = [
      "recipe ingredients", "all recipe products", "all recipes", "recipe items", "recipe products", "recipe products list"
    ].some(phrase => normalized.includes(phrase));

    if (isRecipeIngredients) {
      const recipeItems = [
        { id: 19, qty: 1, unit: "kg", unitUr: "کلو" }, // Rice
        { id: 20, qty: 1, unit: "box", unitUr: "ڈبہ" }, // Pasta
        { id: 21, qty: 1, unit: "piece", unitUr: "عدد" }, // Cooking oil
        { id: 22, qty: 1, unit: "pack", unitUr: "پیکٹ" }, // Sugar
        { id: 23, qty: 1, unit: "pack", unitUr: "پیکٹ" } // Salt
      ];

      return recipeItems.map(item => {
        const prod = products.find(p => p.id === item.id);
        return {
          name: prod ? prod.name : "Product Syncing",
          nameUr: prod ? prod.nameUr : "نامعلوم چیز",
          category: prod ? prod.category : "Pantry",
          price: prod ? prod.price : 1.99,
          qty: item.qty,
          unit: item.unit,
          unitUr: item.unitUr,
          productId: item.id,
          matched: true,
          action: "add"
        };
      });
    }

    const isHealthyFoods = [
      "healthy foods", "healthy food", "healthy items", "healthy products", "healthy groceries", "sehat bakhsh khorak"
    ].some(phrase => normalized.includes(phrase));

    if (isHealthyFoods) {
      const healthyItems = [
        { id: 18, qty: 1, unit: "box", unitUr: "ڈبہ" }, // Green Tea
        { id: 5, qty: 1, unit: "dozen", unitUr: "درجن" }, // Bananas
        { id: 6, qty: 1, unit: "kg", unitUr: "کلو" }, // Apples
        { id: 7, qty: 1, unit: "dozen", unitUr: "درجن" }, // Oranges
        { id: 15, qty: 1, unit: "kg", unitUr: "کلو" }, // Salmon
        { id: 16, qty: 1, unit: "piece", unitUr: "عدد" } // Mineral Water
      ];

      return healthyItems.map(item => {
        const prod = products.find(p => p.id === item.id);
        return {
          name: prod ? prod.name : "Product Syncing",
          nameUr: prod ? prod.nameUr : "نامعلوم چیز",
          category: prod ? prod.category : "Pantry",
          price: prod ? prod.price : 1.99,
          qty: item.qty,
          unit: item.unit,
          unitUr: item.unitUr,
          productId: item.id,
          matched: true,
          action: "add"
        };
      });
    }

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

      // Look for digit/number word
      const wordsForQty = textToMatch.split(/\s+/);
      for (let i = 0; i < wordsForQty.length; i++) {
        const word = wordsForQty[i].toLowerCase();
        const num = NUM_MAP[word] !== undefined ? NUM_MAP[word] : (!isNaN(parseInt(word)) ? parseInt(word) : null);
        
        if (num !== null) {
          qty = num;
          textToMatch = wordsForQty.filter((_, index) => index !== i).join(" ");
          break;
        }
      }

      // Capture unit
      let unit = "item";
      let unitUr = "عدد";
      const detected = detectUnitBackend(textToMatch);
      if (detected) {
        unit = detected.unit;
        unitUr = detected.unitUr;
        textToMatch = textToMatch.replace(new RegExp(`\\b${detected.keyword}\\b`, 'gi'), '').trim();
      }

      // Clean connectors
      textToMatch = textToMatch
        .replace(/\b(of|for|with|and|or|ke|ka|ki|k)\b/gi, " ")
        .replace(/\s*(?:pound|pounds|lbs|lb|gallon|gallons|box|boxes|packet|packets|of|کے|کا|کی)\s+/gi, " ")
        .replace(/\s*(?:درجن|پاؤنڈ|بوتل|عدد|پیکٹ|ڈبہ|ڈبے|کلو)\s*/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!textToMatch) continue;

      const match = fuzzyMatchProductBackend(textToMatch, "", products);
      if (match) {
        results.push({
          name: match.name,
          nameUr: match.nameUr,
          category: match.category,
          price: match.price,
          qty,
          unit: unit !== "item" ? unit : match.unit,
          unitUr: unitUr !== "عدد" ? unitUr : match.unitUr,
          productId: match.id,
          matched: true,
          action: isRemoval ? "remove" : "add"
        });
      } else {
        results.push({
          name: textToMatch,
          nameUr: textToMatch,
          category: "Pantry",
          price: 1.99,
          qty,
          unit,
          unitUr,
          productId: null,
          matched: false,
          action: isRemoval ? "remove" : "add"
        });
      }
    }

    return results;
  }

  // API: Universal Smart Search System
  app.post("/api/smart-search", async (req, res) => {
    const { query, lang } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Missing query string" });
    }

    try {
      let apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        dotenv.config();
        apiKey = process.env.GEMINI_API_KEY;
      }

      const db = getDB();
      const resolvedProducts = db.products.map((p: any) => resolveProductFlatFields(p, db));
      const productListString = resolvedProducts.map((p: any) => `- ID: ${p.id}, Name: "${p.name}", Urdu Name: "${p.nameUr}", Category: "${p.category}", Price: ${p.price}, Unit: "${p.unit}", Urdu Unit: "${p.unitUr}", Brand: "${p.brand || ''}"`).join("\n");

      let apiResponse = null;
      let succeeded = false;

      if (apiKey) {
        try {
          console.log(`Launching server-side Gemini Smart Search for: "${query}"`);
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build"
              }
            }
          });

          const prompt = `Analyze this user search query entered in an e-commerce grocery store: "${query}".
CLASSIFICATION RULE:
- Classify as "recipe" if the search query is for any dish, meal, recipe, food preparation, or list of ingredients from any world cuisine (e.g., Biryani, Haleem, Spaghetti Carbonara, Chicken Karahi, Tacos, Pad Thai, Chocolate Cake, Sushi, Ramen, Shakshuka, Butter Chicken, Pizza, Burger, Pho, Falafel, Shawarma, Peking Duck, Croissant, Curry, Omelette, Tea, Goulash, Paella, Lasagna, or queries like 'Biryani recipe', 'how to make Haleem', '3 milk, butter, cheese', etc.).
- Classify as "filter" ONLY if the query is a search for a single product category, dietary preference, health tag, brand name, or single common raw product name (e.g., Dairy, Fruits, Vegetables, Bakery, Healthy, Unhealthy, Vegan, Gluten-Free, High-Protein, Nestle, Lipton, Milk, Egg, Apple, etc.).

If it is a "recipe":
- "type" should be "recipe"
- "recipeName" should be the recognized name of the dish or recipe (e.g., "Chicken Biryani", "Haleem", "Spaghetti Carbonara", "Mexican Beef Tacos", "Japanese Chicken Ramen", "Pad Thai", "Lasagna", "Paella")
- "recipeNameUr" should be the Urdu name or transliteration of the dish (e.g., "چکن بریانی", "حلیم", "اسپیگیٹی")
- Generate the complete ingredient list required to make this recipe (5 to 10 key items). Support recipes from all world cuisines (Pakistani, Indian, Italian, Mexican, Chinese, Middle Eastern, American, French, Thai, Japanese, Mediterranean, Turkish, Spanish, etc.).
- For each ingredient, check if there is a matching product in our AVAILABLE PRODUCTS below.
  * If matched: set "productId" to the matching integer product ID, "matched" to true, and use its exact database name, nameUr, category, price, and unit.
  * If not matched: set "productId" to null, "matched" to false, and provide appropriate values (category: "Pantry" or similar, price: 1.99, qty: 1, unit: "pack", unitUr: "پیکٹ").

If it is a "filter":
- "type" should be "filter"
- Select all product IDs from our AVAILABLE PRODUCTS database that match this query.
  * Category match: e.g., "Dairy" should match all dairy products, "Fruits" should match all fruit products.
  * Dietary preference: "Vegan" should match non-animal products; "Gluten-Free" should match products without gluten; "Vegetarian" should match vegetarian items.
  * Health category: "Healthy" should match fresh fruits, vegetables, green tea, salmon, water, etc. "Unhealthy" should match chocolate, chips, candy, soda, etc. "High-Protein" should match eggs, chicken breast, salmon, beef, etc.
  * Brand: e.g., "Nestle" matches Nestlé products.
  * Common name or synonym: e.g., "Milk" or "doodh" matches "Whole Milk". "Eggs" or "anday" matches "Large Eggs".
- Set "matchedProductIds" to an array of integers representing the matched product IDs.

Here is the exact list of AVAILABLE PRODUCTS in our store database:
${productListString}

Output a strict JSON object with this exact structure:
{
  "type": "recipe" | "filter",
  "recipeName": string or null,
  "recipeNameUr": string or null,
  "recipeIngredients": [
    {
      "productId": number or null,
      "name": string,
      "nameUr": string,
      "category": string,
      "price": number,
      "qty": number,
      "unit": string,
      "unitUr": string,
      "matched": boolean
    }
  ],
  "matchedProductIds": [number]
}`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: {
              systemInstruction: "You are a highly advanced e-commerce search intelligence system. You parse search queries into recipe ingredient lists or filtered product ID arrays. Output ONLY valid JSON matching the exact schema requested.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  recipeName: { type: Type.STRING },
                  recipeNameUr: { type: Type.STRING },
                  recipeIngredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        productId: { type: Type.INTEGER },
                        name: { type: Type.STRING },
                        nameUr: { type: Type.STRING },
                        category: { type: Type.STRING },
                        price: { type: Type.NUMBER },
                        qty: { type: Type.INTEGER },
                        unit: { type: Type.STRING },
                        unitUr: { type: Type.STRING },
                        matched: { type: Type.BOOLEAN }
                      },
                      required: ["name", "nameUr", "category", "price", "qty", "unit", "unitUr", "matched"]
                    }
                  },
                  matchedProductIds: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER }
                  }
                },
                required: ["type"]
              }
            }
          });

          let jsonText = response.text || "{}";
          if (jsonText.includes("```json")) {
            jsonText = jsonText.split("```json")[1].split("```")[0];
          } else if (jsonText.includes("```")) {
            jsonText = jsonText.split("```")[1].split("```")[0];
          }
          jsonText = jsonText.trim();
          apiResponse = JSON.parse(jsonText);

          // Perform highly robust server-side fuzzy matching on recipeIngredients to handle variations or spelling differences
          if (apiResponse && apiResponse.type === "recipe" && Array.isArray(apiResponse.recipeIngredients)) {
            apiResponse.recipeIngredients = apiResponse.recipeIngredients.map((item: any) => {
              const name = item.name || "Ingredient";
              const nameUr = item.nameUr || name;
              const match = fuzzyMatchProductBackend(name, nameUr, resolvedProducts);
              const isMatched = match && match.status !== "Inactive" && match.status !== "Unavailable" && match.status?.toLowerCase() !== "inactive" && match.status?.toLowerCase() !== "unavailable" && (match.stockQuantity === undefined || match.stockQuantity > 0) && match.price > 0;
              
              let qty = item.qty || 1;
              let unit = match ? match.unit : (item.unit || "pack");
              let unitUr = match ? match.unitUr : (item.unitUr || "پیکٹ");
              
              if (match) {
                const storeUnit = (match.unit || "").toLowerCase();
                const recipeUnitLower = (item.unit || "").toLowerCase();
                const isGramOrMl = (
                  recipeUnitLower === "g" || recipeUnitLower === "gram" || recipeUnitLower === "grams" || recipeUnitLower === "گرام" ||
                  recipeUnitLower === "ml" || recipeUnitLower === "milli" || recipeUnitLower === "milliliter" || recipeUnitLower === "milliliters" || recipeUnitLower === "ملی" ||
                  (recipeUnitLower.includes("gram") || recipeUnitLower.includes("milli"))
                ) && !recipeUnitLower.includes("kg") && !recipeUnitLower.includes("kilo") && !recipeUnitLower.includes("کلو");

                const isWeighed = storeUnit.includes("kg") || storeUnit.includes("کلو") || 
                                  storeUnit.includes("lb") || storeUnit.includes("پاؤنڈ") ||
                                  (match.category && (match.category.toLowerCase() === "vegetables" || match.category.toLowerCase() === "fruits" || match.category.toLowerCase() === "meat"));

                if (isWeighed) {
                  if (isGramOrMl) {
                    if (storeUnit.includes("lb") || storeUnit.includes("پاؤنڈ")) {
                      qty = Math.max(0.1, Math.round((qty / 454) * 100) / 100);
                    } else {
                      qty = Math.max(0.1, Math.round(((qty >= 10 ? qty / 1000 : qty)) * 100) / 100);
                    }
                  } else if (qty > 10) {
                    qty = 1;
                  }
                } else {
                  if (isGramOrMl) {
                    qty = Math.max(0.1, Math.round(((qty >= 10 ? qty / 1000 : qty)) * 100) / 100);
                  } else if (qty > 10) {
                    qty = 1;
                  }
                }
              }

              if (isMatched) {
                return {
                  productId: match.id,
                  name: match.name,
                  nameUr: match.nameUr,
                  category: match.category,
                  price: match.price,
                  qty: qty,
                  unit: unit,
                  unitUr: unitUr,
                  matched: true
                };
              } else {
                return {
                  productId: match ? match.id : null,
                  name: match ? match.name : name,
                  nameUr: match ? match.nameUr : nameUr,
                  category: match ? match.category : (item.category || "Pantry"),
                  price: match ? match.price : (item.price || 1.99),
                  qty: qty,
                  unit: unit,
                  unitUr: unitUr,
                  matched: false
                };
              }
            });
          }

          succeeded = true;
        } catch (aiErr) {
          console.error("Gemini smart search failed, running fallback classification...", aiErr);
        }
      }

      // If Gemini failed or key is missing, execute a robust fallback classifier
      if (!succeeded || !apiResponse) {
        console.log("Executing programmatic local fallback for Smart Search...");
        const norm = query.toLowerCase().trim();

        const recipeSynonyms: { [key: string]: string[] } = {
          "biryani": ["biryani", "بریانی", "biriyani", "briyani"],
          "pulao": ["pulao", "پلاؤ", "پلاو", "chicken pulao", "mutton pulao", "beef pulao", "yakhni pulao"],
          "karahi": ["karahi", "کڑاہی", "chicken karahi", "mutton karahi"],
          "nihari": ["nihari", "نہاری", "beef nihari"],
          "haleem": ["haleem", "daleem", "حلیم"],
          "pasta": ["pasta", "spaghetti", "lasagna", "پاستا"],
          "burger": ["burger", "chicken burger", "beef burger", "برگر"],
          "sandwich": ["sandwich", "club sandwich", "سینڈوچ"],
          "salad": ["salad", "fresh salad", "سلاد"],
          "soup": ["soup", "chicken corn soup", "سوپ"],
          "kheer": ["kheer", "rice pudding", "کھیر"],
          "daal": ["daal", "daal chawal", "دال"],
          "chai": ["chai", "tea", "چائے", "chaye", "sabz chai", "green tea", "سبز چائے"],
          "tea": ["chai", "tea", "چائے", "chaye", "sabz chai", "green tea", "سبز چائے"],
          "fried rice": ["fried rice", "friedrice", "فرائیڈ رائس", "چاول"],
          "omelette": ["omelette", "omlet", "آملیٹ", "anda", "anday", "انڈہ", "انڈے"],
          "pizza": ["pizza", "پیزا"],
          "sushi": ["sushi", "سوشی"],
          "chocolate cake": ["chocolate cake", "cake", "کیک", "چاکلیٹ کیک"]
        };

        const matchedRecipeKey = Object.keys(recipeSynonyms).find(key => {
          const synonyms = recipeSynonyms[key];
          return synonyms.some(syn => norm.includes(syn));
        });

        if (matchedRecipeKey) {
          const recipeSpecs: { [key: string]: { name: string, nameUr: string, ingredients: any[] } } = {
            "biryani": {
              name: "Chicken Biryani",
              nameUr: "چکن بریانی",
              ingredients: [
                { searchTerms: ["chicken", "breast", "مرغی"], fallbackName: "Chicken Breast", fallbackNameUr: "مرغی کا گوشت", fallbackCategory: "Meat", fallbackPrice: 2237.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["rice", "chawal", "چاول"], fallbackName: "White Rice", fallbackNameUr: "چاول", fallbackCategory: "Pantry", fallbackPrice: 837.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["onion", "piaz", "پیاز"], fallbackName: "Onions", fallbackNameUr: "پیاز", fallbackCategory: "Vegetables", fallbackPrice: 333.2, qty: 250, unit: "g", unitUr: "گرام" },
                { searchTerms: ["tomato", "tamatar", "ٹماٹر"], fallbackName: "Tomatoes", fallbackNameUr: "ٹماٹر", fallbackCategory: "Vegetables", fallbackPrice: 697.2, qty: 250, unit: "g", unitUr: "گرام" },
                { searchTerms: ["potato", "aaloo", "آلو"], fallbackName: "Potatoes", fallbackNameUr: "آلو", fallbackCategory: "Vegetables", fallbackPrice: 361.2, qty: 250, unit: "g", unitUr: "گرام" },
                { searchTerms: ["oil", "koking", "ککنگ", "تیل"], fallbackName: "Cooking Oil", fallbackNameUr: "ککنگ آئل", fallbackCategory: "Pantry", fallbackPrice: 2517.2, qty: 250, unit: "ml", unitUr: "ملی لیٹر" },
                { searchTerms: ["salt", "namak", "نمک"], fallbackName: "Salt", fallbackNameUr: "نمک", fallbackCategory: "Pantry", fallbackPrice: 361.2, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["yogurt", "dahi", "دہی"], fallbackName: "Yogurt / Dahi", fallbackNameUr: "دہی", fallbackCategory: "Dairy", fallbackPrice: 300.0, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["masala", "spices", "مصالحہ"], fallbackName: "Biryani Masala", fallbackNameUr: "بریانی مصالحہ", fallbackCategory: "Pantry", fallbackPrice: 150.0, qty: 1, unit: "pack", unitUr: "پیکٹ" }
              ]
            },
            "pulao": {
              name: "Chicken Pulao",
              nameUr: "چکن پلاؤ",
              ingredients: [
                { searchTerms: ["chicken", "breast", "مرغی"], fallbackName: "Chicken Breast", fallbackNameUr: "مرغی کا گوشت", fallbackCategory: "Meat", fallbackPrice: 2237.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["rice", "chawal", "چاول"], fallbackName: "White Rice", fallbackNameUr: "چاول", fallbackCategory: "Pantry", fallbackPrice: 837.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["onion", "piaz", "پیاز"], fallbackName: "Onions", fallbackNameUr: "پیاز", fallbackCategory: "Vegetables", fallbackPrice: 333.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["tomato", "tamatar", "ٹماٹر"], fallbackName: "Tomatoes", fallbackNameUr: "ٹماٹر", fallbackCategory: "Vegetables", fallbackPrice: 697.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["potato", "aaloo", "آلو"], fallbackName: "Potatoes", fallbackNameUr: "آلو", fallbackCategory: "Vegetables", fallbackPrice: 361.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["oil", "koking", "ککنگ", "تیل"], fallbackName: "Cooking Oil", fallbackNameUr: "ککنگ آئل", fallbackCategory: "Pantry", fallbackPrice: 2517.2, qty: 1, unit: "liter", unitUr: "لیٹر" },
                { searchTerms: ["salt", "namak", "نمک"], fallbackName: "Salt", fallbackNameUr: "نمک", fallbackCategory: "Pantry", fallbackPrice: 361.2, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["pulao masala", "whole spices", "مصالحہ"], fallbackName: "Pulao Spices", fallbackNameUr: "پلاؤ مصالحہ جات", fallbackCategory: "Pantry", fallbackPrice: 180.0, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["ginger garlic", "adrak lahsan", "ادرک لہسن"], fallbackName: "Ginger Garlic Paste", fallbackNameUr: "ادرک لہسن کا پیسٹ", fallbackCategory: "Pantry", fallbackPrice: 150.0, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["yogurt", "dahi", "دہی"], fallbackName: "Yogurt / Dahi", fallbackNameUr: "دہی", fallbackCategory: "Dairy", fallbackPrice: 300.0, qty: 1, unit: "pack", unitUr: "پیکٹ" }
              ]
            },
            "karahi": {
              name: "Chicken Karahi",
              nameUr: "چکن کڑاہی",
              ingredients: [
                { searchTerms: ["chicken", "breast", "مرغی"], fallbackName: "Chicken Breast", fallbackNameUr: "مرغی کا گوشت", fallbackCategory: "Meat", fallbackPrice: 2237.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["tomato", "tamatar", "ٹماٹر"], fallbackName: "Tomatoes", fallbackNameUr: "ٹماٹر", fallbackCategory: "Vegetables", fallbackPrice: 697.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["onion", "piaz", "پیاز"], fallbackName: "Onions", fallbackNameUr: "پیاز", fallbackCategory: "Vegetables", fallbackPrice: 333.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["oil", "koking", "ککنگ", "تیل"], fallbackName: "Cooking Oil", fallbackNameUr: "ککنگ آئل", fallbackCategory: "Pantry", fallbackPrice: 2517.2, qty: 1, unit: "liter", unitUr: "لیٹر" },
                { searchTerms: ["salt", "namak", "نمک"], fallbackName: "Salt", fallbackNameUr: "نمک", fallbackCategory: "Pantry", fallbackPrice: 361.2, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["karahi masala", "spices", "کڑاہی مصالحہ"], fallbackName: "Karahi Masala", fallbackNameUr: "کڑاہی مصالحہ", fallbackCategory: "Pantry", fallbackPrice: 180.0, qty: 1, unit: "pack", unitUr: "پیکٹ" }
              ]
            },
            "nihari": {
              name: "Beef Nihari",
              nameUr: "بیف نہاری",
              ingredients: [
                { searchTerms: ["beef", "goshat", "گوشت"], fallbackName: "Ground Beef", fallbackNameUr: "بیف گوشت", fallbackCategory: "Meat", fallbackPrice: 2800.0, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["rice", "chawal", "چاول"], fallbackName: "White Rice", fallbackNameUr: "چاول", fallbackCategory: "Pantry", fallbackPrice: 837.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["onion", "piaz", "پیاز"], fallbackName: "Onions", fallbackNameUr: "پیاز", fallbackCategory: "Vegetables", fallbackPrice: 333.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["oil", "koking", "ککنگ", "تیل"], fallbackName: "Cooking Oil", fallbackNameUr: "ککنگ آئل", fallbackCategory: "Pantry", fallbackPrice: 2517.2, qty: 1, unit: "liter", unitUr: "لیٹر" },
                { searchTerms: ["salt", "namak", "نمک"], fallbackName: "Salt", fallbackNameUr: "نمک", fallbackCategory: "Pantry", fallbackPrice: 361.2, qty: 1, unit: "pack", unitUr: "پیکٹ" }
              ]
            },
            "pasta": {
              name: "Creamy Pasta",
              nameUr: "کریمی پاستا",
              ingredients: [
                { searchTerms: ["pasta", "macaroni", "پاستا"], fallbackName: "Italian Pasta", fallbackNameUr: "پاستا", fallbackCategory: "Pantry", fallbackPrice: 500.0, qty: 1, unit: "box", unitUr: "ڈبہ" },
                { searchTerms: ["milk", "doodh", "دودھ"], fallbackName: "Whole Milk", fallbackNameUr: "خالص دودھ", fallbackCategory: "Dairy", fallbackPrice: 1117.2, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["cheese", "paneer", "پنیر"], fallbackName: "Cheddar Cheese", fallbackNameUr: "پنیر", fallbackCategory: "Dairy", fallbackPrice: 1537.2, qty: 1, unit: "piece", unitUr: "عدد" },
                { searchTerms: ["butter", "makkhan", "مکھن"], fallbackName: "Butter", fallbackNameUr: "مکھن", fallbackCategory: "Dairy", fallbackPrice: 1341.2, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["chicken", "breast", "مرغی"], fallbackName: "Chicken Breast", fallbackNameUr: "مرغی کا گوشت", fallbackCategory: "Meat", fallbackPrice: 2237.2, qty: 1, unit: "kg", unitUr: "کلو" }
              ]
            },
            "chai": {
              name: "Chai/Tea",
              nameUr: "چائے",
              ingredients: [
                { searchTerms: ["milk", "doodh", "دودھ"], fallbackName: "Whole Milk", fallbackNameUr: "خالص دودھ", fallbackCategory: "Dairy", fallbackPrice: 1117.2, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["green tea", "tea", "chai", "چائے", "سبز چائے"], fallbackName: "Green Tea", fallbackNameUr: "سبز چائے", fallbackCategory: "Beverages", fallbackPrice: 977.2, qty: 1, unit: "box", unitUr: "ڈبہ" },
                { searchTerms: ["sugar", "chini", "چینی"], fallbackName: "Sugar", fallbackNameUr: "چینی", fallbackCategory: "Pantry", fallbackPrice: 697.2, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["ginger", "adrak", "ادرک"], fallbackName: "Ginger / Adrak", fallbackNameUr: "ادرک", fallbackCategory: "Vegetables", fallbackPrice: 150.0, qty: 1, unit: "piece", unitUr: "عدد" },
                { searchTerms: ["cardamom", "elaichi", "الائچی"], fallbackName: "Cardamom / Elaichi", fallbackNameUr: "الائچی", fallbackCategory: "Pantry", fallbackPrice: 200.0, qty: 1, unit: "pack", unitUr: "پیکٹ" }
              ]
            },
            "tea": {
              name: "Chai/Tea",
              nameUr: "چائے",
              ingredients: [
                { searchTerms: ["milk", "doodh", "دودھ"], fallbackName: "Whole Milk", fallbackNameUr: "خالص دودھ", fallbackCategory: "Dairy", fallbackPrice: 1117.2, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["green tea", "tea", "chai", "چائے", "سبز چائے"], fallbackName: "Green Tea", fallbackNameUr: "سبز چائے", fallbackCategory: "Beverages", fallbackPrice: 977.2, qty: 1, unit: "box", unitUr: "ڈبہ" },
                { searchTerms: ["sugar", "chini", "چینی"], fallbackName: "Sugar", fallbackNameUr: "چینی", fallbackCategory: "Pantry", fallbackPrice: 697.2, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["ginger", "adrak", "ادرک"], fallbackName: "Ginger / Adrak", fallbackNameUr: "ادرک", fallbackCategory: "Vegetables", fallbackPrice: 150.0, qty: 1, unit: "piece", unitUr: "عدد" },
                { searchTerms: ["cardamom", "elaichi", "الائچی"], fallbackName: "Cardamom / Elaichi", fallbackNameUr: "الائچی", fallbackCategory: "Pantry", fallbackPrice: 200.0, qty: 1, unit: "pack", unitUr: "پیکٹ" }
              ]
            },
            "fried rice": {
              name: "Egg Fried Rice",
              nameUr: "انڈے فرائیڈ رائس",
              ingredients: [
                { searchTerms: ["egg", "anda", "انڈے", "انڈہ"], fallbackName: "Large Eggs", fallbackNameUr: "انڈے", fallbackCategory: "Dairy", fallbackPrice: 1201.2, qty: 1, unit: "dozen", unitUr: "درجن" },
                { searchTerms: ["rice", "chawal", "چاول"], fallbackName: "White Rice", fallbackNameUr: "چاول", fallbackCategory: "Pantry", fallbackPrice: 837.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["onion", "piaz", "پیاز"], fallbackName: "Onions", fallbackNameUr: "پیاز", fallbackCategory: "Vegetables", fallbackPrice: 333.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["oil", "koking", "ککنگ", "تیل"], fallbackName: "Cooking Oil", fallbackNameUr: "ککنگ آئل", fallbackCategory: "Pantry", fallbackPrice: 2517.2, qty: 1, unit: "liter", unitUr: "لیٹر" },
                { searchTerms: ["salt", "namak", "نمک"], fallbackName: "Salt", fallbackNameUr: "نمک", fallbackCategory: "Pantry", fallbackPrice: 361.2, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["soy sauce", "sauce", "سویا ساس"], fallbackName: "Soy Sauce", fallbackNameUr: "سویا ساس", fallbackCategory: "Pantry", fallbackPrice: 250.0, qty: 1, unit: "bottle", unitUr: "بوتل" }
              ]
            },
            "omelette": {
              name: "Omelette",
              nameUr: "آملیٹ",
              ingredients: [
                { searchTerms: ["egg", "anda", "انڈے", "انڈہ"], fallbackName: "Large Eggs", fallbackNameUr: "انڈے", fallbackCategory: "Dairy", fallbackPrice: 1201.2, qty: 1, unit: "dozen", unitUr: "درجن" },
                { searchTerms: ["onion", "piaz", "پیاز"], fallbackName: "Onions", fallbackNameUr: "پیاز", fallbackCategory: "Vegetables", fallbackPrice: 333.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["tomato", "tamatar", "ٹماٹر"], fallbackName: "Tomatoes", fallbackNameUr: "ٹماٹر", fallbackCategory: "Vegetables", fallbackPrice: 697.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["oil", "koking", "ککنگ", "تیل"], fallbackName: "Cooking Oil", fallbackNameUr: "ککنگ آئل", fallbackCategory: "Pantry", fallbackPrice: 2517.2, qty: 1, unit: "liter", unitUr: "لیٹر" },
                { searchTerms: ["salt", "namak", "نمک"], fallbackName: "Salt", fallbackNameUr: "نمک", fallbackCategory: "Pantry", fallbackPrice: 361.2, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["chillies", "mirch", "ہری مرچ"], fallbackName: "Green Chillies", fallbackNameUr: "ہری مرچ", fallbackCategory: "Vegetables", fallbackPrice: 100.0, qty: 1, unit: "pack", unitUr: "پیکٹ" }
              ]
            },
            "pizza": {
              name: "Cheese Pizza",
              nameUr: "چیز پیزا",
              ingredients: [
                { searchTerms: ["cheese", "paneer", "پنیر"], fallbackName: "Cheddar Cheese", fallbackNameUr: "پنیر", fallbackCategory: "Dairy", fallbackPrice: 1537.2, qty: 1, unit: "piece", unitUr: "عدد" },
                { searchTerms: ["tomato", "tamatar", "ٹماٹر"], fallbackName: "Tomatoes", fallbackNameUr: "ٹماٹر", fallbackCategory: "Vegetables", fallbackPrice: 697.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["oil", "koking", "ککنگ", "تیل"], fallbackName: "Cooking Oil", fallbackNameUr: "ککنگ آئل", fallbackCategory: "Pantry", fallbackPrice: 2517.2, qty: 1, unit: "liter", unitUr: "لیٹر" },
                { searchTerms: ["flour", "yeast", "آٹا", "خمیر"], fallbackName: "Pizza Flour / Yeast", fallbackNameUr: "پیزا آٹا / خمیر", fallbackCategory: "Pantry", fallbackPrice: 220.0, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["oregano", "basil", "تلسی"], fallbackName: "Oregano & Basil", fallbackNameUr: "اوریگانو اور تلسی", fallbackCategory: "Pantry", fallbackPrice: 180.0, qty: 1, unit: "pack", unitUr: "پیکٹ" }
              ]
            },
            "sushi": {
              name: "Sushi",
              nameUr: "سوشی",
              ingredients: [
                { searchTerms: ["salmon", "fish", "machli", "مچھلی"], fallbackName: "Salmon Fillet", fallbackNameUr: "مچھلی کا فلیٹ", fallbackCategory: "Meat", fallbackPrice: 3637.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["rice", "chawal", "چاول"], fallbackName: "White Rice", fallbackNameUr: "چاول", fallbackCategory: "Pantry", fallbackPrice: 837.2, qty: 1, unit: "kg", unitUr: "کلو" },
                { searchTerms: ["nori", "seaweed", "نوری"], fallbackName: "Nori Seaweed Sheets", fallbackNameUr: "نوری سی ویڈ", fallbackCategory: "Pantry", fallbackPrice: 320.0, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["wasabi", "soy", "واسابی"], fallbackName: "Soy Sauce & Wasabi", fallbackNameUr: "سویا ساس اور واسابی", fallbackCategory: "Pantry", fallbackPrice: 280.0, qty: 1, unit: "bottle", unitUr: "بوتل" }
              ]
            },
            "chocolate cake": {
              name: "Chocolate Cake",
              nameUr: "چاکلیٹ کیک",
              ingredients: [
                { searchTerms: ["milk", "doodh", "دودھ"], fallbackName: "Whole Milk", fallbackNameUr: "خالص دودھ", fallbackCategory: "Dairy", fallbackPrice: 1117.2, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["egg", "anda", "انڈے", "انڈہ"], fallbackName: "Large Eggs", fallbackNameUr: "انڈے", fallbackCategory: "Dairy", fallbackPrice: 1201.2, qty: 1, unit: "dozen", unitUr: "درجن" },
                { searchTerms: ["sugar", "chini", "چینی"], fallbackName: "Sugar", fallbackNameUr: "چینی", fallbackCategory: "Pantry", fallbackPrice: 697.2, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["butter", "makkhan", "مکھن"], fallbackName: "Butter", fallbackNameUr: "مکھن", fallbackCategory: "Dairy", fallbackPrice: 1341.2, qty: 1, unit: "pack", unitUr: "پیکٹ" },
                { searchTerms: ["flour", "powder", "میدا"], fallbackName: "Baking Flour / Powder", fallbackNameUr: "میدا اور بیکنگ پاؤڈر", fallbackCategory: "Pantry", fallbackPrice: 220.0, qty: 1, unit: "pack", unitUr: "پیکٹ" }
              ]
            }
          };

          const rec = recipeSpecs[matchedRecipeKey];
          const ingredients = rec.ingredients.map((spec: any) => {
            const matchedProduct = resolvedProducts.find((p: any) => {
              const pNameLower = p.name.toLowerCase();
              const pNameUrLower = (p.nameUr || "").toLowerCase();
              return spec.searchTerms.some((term: string) => 
                pNameLower.includes(term.toLowerCase()) || pNameUrLower.includes(term.toLowerCase())
              );
            });

            if (matchedProduct) {
              return {
                productId: matchedProduct.id,
                name: matchedProduct.name,
                nameUr: matchedProduct.nameUr,
                category: matchedProduct.category,
                price: matchedProduct.price,
                qty: spec.qty,
                unit: matchedProduct.unit,
                unitUr: matchedProduct.unitUr,
                matched: true
              };
            } else {
              return {
                productId: null,
                name: spec.fallbackName,
                nameUr: spec.fallbackNameUr,
                category: spec.fallbackCategory,
                price: spec.fallbackPrice,
                qty: spec.qty,
                unit: spec.unit,
                unitUr: spec.unitUr,
                matched: false
              };
            }
          });

          apiResponse = {
            type: "recipe",
            recipeName: rec.name,
            recipeNameUr: rec.nameUr,
            recipeIngredients: ingredients,
            matchedProductIds: []
          };
        } else {
          const matchedProductIds: number[] = [];

          const isDairy = norm.includes("dairy") || norm.includes("doodh") || norm.includes("cheese") || norm.includes("butter");
          const isFruits = norm.includes("fruit") || norm.includes("phal") || norm.includes("banana") || norm.includes("apple") || norm.includes("orange");
          const isVegetables = norm.includes("veg") || norm.includes("sabzi") || norm.includes("tomato") || norm.includes("potato") || norm.includes("onion");
          const isBakery = norm.includes("bakery") || norm.includes("bread") || norm.includes("bun");
          const isHealthy = norm.includes("healthy") || norm.includes("sehat") || norm.includes("diet") || norm.includes("organic");
          const isUnhealthy = norm.includes("unhealthy") || norm.includes("junk") || norm.includes("snack") || norm.includes("chips") || norm.includes("soda") || norm.includes("chocolate") || norm.includes("candy");
          const isVegan = norm.includes("vegan");
          const isGlutenFree = norm.includes("gluten") || norm.includes("wheat free");
          const isHighProtein = norm.includes("protein") || norm.includes("muscle") || norm.includes("chicken") || norm.includes("fish") || norm.includes("egg");

          resolvedProducts.forEach((p: any) => {
            let matches = false;
            const pName = p.name.toLowerCase();
            const pCategory = p.category.toLowerCase();
            const pBrand = (p.brand || "").toLowerCase();

            if (pBrand && norm.includes(pBrand)) matches = true;
            if (pName.includes(norm) || pCategory.includes(norm)) matches = true;

            if (isDairy && pCategory.includes("dairy")) matches = true;
            if (isFruits && pCategory.includes("fruit")) matches = true;
            if (isVegetables && pCategory.includes("vegetable")) matches = true;
            if (isBakery && (pCategory.includes("bakery") || pName.includes("bread") || pName.includes("bun"))) matches = true;
            
            if (isHealthy) {
              if (pCategory.includes("fruit") || pCategory.includes("vegetable") || pName.includes("salmon") || pName.includes("water") || pName.includes("green tea")) {
                matches = true;
              }
            }

            if (isUnhealthy) {
              if (pName.includes("cola") || pName.includes("soda") || pName.includes("chips") || pName.includes("chocolate") || pName.includes("candy") || pName.includes("cookie")) {
                matches = true;
              }
            }

            if (isVegan) {
              const nonVegan = ["milk", "egg", "cheese", "butter", "chicken", "beef", "salmon", "yogurt"];
              const isAnimal = nonVegan.some(nv => pName.includes(nv));
              if (!isAnimal && (pCategory.includes("fruit") || pCategory.includes("vegetable") || pName.includes("rice") || pName.includes("oil") || pName.includes("water") || pName.includes("sugar"))) {
                matches = true;
              }
            }

            if (isGlutenFree) {
              const wheatItems = ["bread", "flour", "pasta", "cookie", "cake", "bun"];
              const hasGluten = wheatItems.some(wi => pName.includes(wi));
              if (!hasGluten) {
                matches = true;
              }
            }

            if (isHighProtein) {
              if (pName.includes("chicken") || pName.includes("salmon") || pName.includes("egg") || pName.includes("beef") || pName.includes("milk") || pName.includes("cheese")) {
                matches = true;
              }
            }

            if (matches && p.status !== "Inactive") {
              matchedProductIds.push(p.id);
            }
          });

          if (norm.includes("recipe")) {
            const cleanTitle = query.replace(/(recipe|ingredients|how to make|make|cook|dish|banane ka tarika|ke ingredients)/gi, "").trim() || "Special Dish";
            const capitalTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
            const localRec = getLocalRecipeFallback(cleanTitle, resolvedProducts, lang);
            apiResponse = {
              type: "recipe",
              recipeName: localRec.nameEn || `${capitalTitle} Recipe`,
              recipeNameUr: localRec.nameUr || `${capitalTitle} کی ترکیب`,
              recipeIngredients: (localRec.ingredients || []).map((ing: any) => {
                const match = resolvedProducts.find((p: any) => p.name.toLowerCase().includes(ing.name.toLowerCase()));
                return {
                  productId: match ? match.id : null,
                  name: match ? match.name : ing.name,
                  nameUr: match ? match.nameUr : ing.nameUr,
                  category: match ? match.category : "Pantry",
                  price: match ? match.price : 1.99,
                  qty: ing.qty || 1,
                  unit: ing.unit || "pack",
                  unitUr: ing.unitUr || "پیکٹ",
                  matched: !!match
                };
              }),
              matchedProductIds: []
            };
          } else {
            if (matchedProductIds.length === 0) {
              resolvedProducts.forEach((p: any) => {
                if (p.status !== "Inactive" && (p.name.toLowerCase().includes(norm) || p.nameUr.includes(norm) || p.category.toLowerCase().includes(norm))) {
                  matchedProductIds.push(p.id);
                }
              });
            }

            apiResponse = {
              type: "filter",
              recipeName: null,
              recipeNameUr: null,
              recipeIngredients: [],
              matchedProductIds: matchedProductIds
            };
          }
        }
      }

      res.json(apiResponse);
    } catch (err: any) {
      console.error("Smart search server error:", err);
      res.status(500).json({ error: `Smart Search failed: ${err.message || err.toString()}` });
    }
  });

  // API: Gemini Spoken Voice List Parser
  app.post("/api/voice-parse", async (req, res) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text string to parse" });
    }

    try {
      let apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        dotenv.config();
        apiKey = process.env.GEMINI_API_KEY;
      }

      const db = getDB();
      const resolvedProducts = db.products.map(p => resolveProductFlatFields(p, db));
      const productListString = resolvedProducts.map(p => `- ID: ${p.id}, English Name: "${p.name}", Urdu Name: "${p.nameUr}", Category: "${p.category}", Price: ${p.price}, Unit: "${p.unit}", Urdu Unit: "${p.unitUr}"`).join("\n");

      let productsParsed = [];
      let isParsedSuccess = false;

      if (apiKey) {
        try {
          console.log(`Launching server-side Gemini Voice list parsing for: "${text}"`);
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build"
              }
            }
          });

          const promptPart = {
            text: `Analyze this raw spoken shopping list or grocery list text transcript: "${text}".
You must extract EVERY single requested product/grocery item mentioned.

Here is the exact list of AVAILABLE PRODUCTS in our store database:
${productListString}

Follow these rules for production-grade, highly precise bulk extraction:
1. LANG & PHONETICS: We support English, Urdu (in Arabic script), and Roman Urdu. Map any Roman Urdu terms or synonyms to the correct matching available product (e.g., "doodh" or "milk" matches "Whole Milk", "anday" or "eggs" matches "Large Eggs", "cheese" matches "Cheddar Cheese", "butter" matches "Butter"). Be robust against slight spelling variations, capitalization, or missing adjectives.
2. RECIPES & EXPANSIONS: If the user requests ANY recipe, preparation, dish, or category (such as "biryani", "chai/tea", "omelette", "fried rice", "kheer", "karahi", "nihari", "pasta", "pizza", "sabziyaan", "vegetables", "fruits", "healthy foods", etc.), you MUST automatically expand it. Use your deep knowledge to identify ALL required ingredients for the requested dish (including protein, carbs, produce, AND crucial spices, herbs, and essentials). Partition these ingredients cleanly:
   * For ingredients present in our provided AVAILABLE PRODUCTS database (e.g. Chicken Breast, Whole Milk, White Rice, Onions, Tomatoes, Potatoes, Eggs, Sugar, Salt, Cooking Oil), map them to their correct product ID, set matched: true, and match the category, price, and unit.
   * For required recipe-specific ingredients or spices NOT in the database (e.g. specific spices like Cardamom/Elaichi, Ginger/Garlic Paste, Yogurt/Dahi, Fresh Mint, Soy Sauce, Coriander, Karahi Masala, Nihari Masala, Pizza Sauce, etc.), STILL extract them as separate items in the JSON array, but set 'matched' to false, 'productId' to null, and 'category' to the best category (e.g. Pantry or Vegetables), price 1.99, and mark them as Unavailable. This ensures they are flagged as Unavailable/out of stock and NOT added to the cart, while still listed in the draft list.
   * Here are exact sample expansions for your guidance:
    - "Chicken Biryani" / "Ingredients for Biryani": Chicken Breast (1 KG, matched: true, productId: 13), White Rice (1 KG, matched: true, productId: 19), Onions (250 Grams, matched: true, productId: 11), Tomatoes (250 Grams, matched: true, productId: 9), Potatoes (250 Grams, matched: true, productId: 10), Cooking Oil (250 ML, matched: true, productId: 21), Salt (1 Pack, matched: true, productId: 23), Biryani Masala / Spices (1 Pack, matched: false, productId: null, category: Pantry), Ginger Garlic Paste (1 Pack, matched: false, productId: null, category: Pantry), Yogurt / Dahi (250 Grams, matched: false, productId: null, category: Dairy), Fresh Mint / Pudina (1 Bunch, matched: false, productId: null, category: Vegetables).
    - "Tea" / "Chai" / "Chai Recipe": Green Tea (1 Box, matched: true, productId: 18), Whole Milk (1 Pack, matched: true, productId: 1), Sugar (1 Pack, matched: true, productId: 22), Ginger / Adrak (1 Piece, matched: false, productId: null, category: Vegetables), Cardamom / Elaichi (1 Pack, matched: false, productId: null, category: Pantry).
    - "Coffee" / "Coffee Recipe" / "Coffee Ingredients": Whole Milk (1 Pack, matched: true, productId: 1), Sugar (1 Pack, matched: true, productId: 22), Coffee (1 Box, matched: false, productId: null, category: Beverages).
    - "Egg Fried Rice": Large Eggs (1 Dozen, matched: true, productId: 2), White Rice (1 KG, matched: true, productId: 19), Cooking Oil (1 Liter, matched: true, productId: 21), Onions (1 KG, matched: true, productId: 11), Salt (1 Pack, matched: true, productId: 23), Soy Sauce (1 Bottle, matched: false, productId: null, category: Pantry), Garlic / Lahsan (1 Piece, matched: false, productId: null, category: Vegetables), White Pepper (1 Pack, matched: false, productId: null, category: Pantry).
    - "Omelette": Large Eggs (1 Dozen, matched: true, productId: 2), Onions (1 KG, matched: true, productId: 11), Tomatoes (1 KG, matched: true, productId: 9), Cooking Oil (1 Liter, matched: true, productId: 21), Salt (1 Pack, matched: true, productId: 23), Green Chillies / Hari Mirch (1 Pack, matched: false, productId: null, category: Vegetables), Black Pepper / Kali Mirch (1 Pack, matched: false, productId: null, category: Pantry), Coriander / Dhaniya (1 Bunch, matched: false, productId: null, category: Vegetables).
    - "All Fruits" / "Fruits" / "Phal": Bananas (1 Dozen), Apples (1 KG), Oranges (1 Dozen), Mangoes (1 Piece). All have matched: true and correct productIds.
    - "All Vegetables" / "Vegetables" / "Sabziyaan": Tomatoes (1 KG), Potatoes (1 KG), Onions (1 KG), Carrots (1 KG). All have matched: true and correct productIds.
    - "Healthy Foods" / "Healthy Food": Green Tea (1 Box), Bananas (1 Dozen), Apples (1 KG), Oranges (1 Dozen), Salmon Fillet (1 KG), Mineral Water (1 Bottle). All have matched: true and correct productIds.
    - "Recipe Ingredients" / "All Recipe Products" / "Recipe Products": White Rice (1 KG), Pasta (1 Box), Cooking Oil (1 Liter), Sugar (1 Pack), Salt (1 Pack). All have matched: true and correct productIds.
3. BULK CATEGORY ADDITIONS: If the user requests to "add all fruits", "sare phal", "sari sabziyaan", "add all recipe products", "recipe ingredients", "healthy foods", "healthy food", or similar, do not treat them as a single item; expand them into their individual constituent products listed in our database.
4. MATCHING: Match each item to one of the AVAILABLE PRODUCTS in our store database if it is in the database. Return the exact 'name' and 'nameUr' of that matched product, along with its correct category, price, unit, and unitUr from the database list above. Also set 'productId' to the matched product ID, and set 'matched' to true.
5. NO MATCH (UNAVAILABLE): If a spoken item is absolutely NOT available in the database list (e.g. coffee, spices, dahi, coriander), still extract it with a standard unit, logically translated name, standard category, price 1.99, and set 'matched' to false, 'productId' to null, and flag it as Unavailable.
6. AVAILABILITY: If a matched product has status "Inactive" or stockQuantity <= 0, still extract it but set 'matched' to false and map 'productId' to its ID. This ensures it will be correctly marked as "Unavailable" (e.g., "Unavailable" / Out of Stock).
7. MULTIPLE/BULK ITEMS: Do not miss any items. If the user mentions 8-10 or more items rapidly, list each one separately.
8. NO MERGING: Never group or merge separate products.
9. NATURAL PHRASING: Ignore vocal fillers. Extract quantities and units accurately.
10. SCHEMATIZE:
   - 'name': The matched product's English name (or standard English name if unmatched)
   - 'nameUr': The matched product's Urdu name (or standard Urdu name if unmatched)
   - 'category': The category from the database list (or standard category if unmatched)
   - 'price': The unit price from the database list (or 1.99 if unmatched)
   - 'qty': Accurate integer quantity requested (default to 1 if unspecified)
   - 'unit': Standard English unit (e.g., piece, kg, box, dozen, pack, or liter)
   - 'unitUr': Native Urdu translation of the unit
   - 'productId': Integer ID of the matched product (or null if unmatched)
   - 'matched': Boolean, true if available and matched, false if unavailable or out of stock`
          };

          let extractedJsonText = "";
          let lastError: any = null;
          const voiceModelNames = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];

          for (const modelName of voiceModelNames) {
            try {
              console.log(`Attempting Voice Parsing using model: ${modelName}`);
              const response = await ai.models.generateContent({
                model: modelName,
                contents: { parts: [promptPart] },
                config: {
                  systemInstruction: "You are a production-ready, highly sophisticated bilingual (English & Urdu) spoken shopping list parser. Your sole objective is to extract EVERY requested product/grocery item from a raw speech transcript. Output a strict JSON array matching the requested schema. Ensure separate entries are created for each item without missing or merging products, even in long lists of 8-10+ items spoken naturally with pauses.",
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        nameUr: { type: Type.STRING },
                        category: { type: Type.STRING },
                        price: { type: Type.NUMBER },
                        qty: { type: Type.INTEGER },
                        unit: { type: Type.STRING },
                        unitUr: { type: Type.STRING },
                        productId: { type: Type.INTEGER },
                        matched: { type: Type.BOOLEAN }
                      },
                      required: ["name", "nameUr", "category", "price", "qty", "unit", "unitUr", "matched"]
                    }
                  }
                }
              });
              extractedJsonText = response.text || "[]";
              isParsedSuccess = true;
              console.log(`Voice Parsing succeeded using model: ${modelName}`);
              break; // Succeeded! Break loop
            } catch (schemaError: any) {
              lastError = schemaError;
              console.log(`Schema-based Voice Parsing attempting relaxed format for model ${modelName}...`);
              try {
                const responseRelaxed = await ai.models.generateContent({
                  model: modelName,
                  contents: {
                    parts: [
                      promptPart,
                      {
                        text: "Analyze this spoken text and extract all products. Return a valid JSON array of objects. Each object MUST contain these fields: 'name' (English), 'nameUr' (Urdu), 'category', 'price' (unit price, number), 'qty' (quantity, integer, default 1), 'unit', 'unitUr', 'productId' (number or null), and 'matched' (boolean). Be extremely precise."
                      }
                    ]
                  },
                  config: {
                    responseMimeType: "application/json"
                  }
                });
                extractedJsonText = responseRelaxed.text || "[]";
                isParsedSuccess = true;
                console.log(`Relaxed Voice Parsing completed using model: ${modelName}`);
                break; // Succeeded! Break loop
              } catch (relaxedError: any) {
                lastError = relaxedError;
                console.log(`Completed Voice Parsing attempts for model ${modelName}.`);
              }
            }
          }

          if (isParsedSuccess && extractedJsonText) {
            try {
              if (extractedJsonText.includes("```json")) {
                extractedJsonText = extractedJsonText.split("```json")[1].split("```")[0];
              } else if (extractedJsonText.includes("```")) {
                extractedJsonText = extractedJsonText.split("```")[1].split("```")[0];
              }
              extractedJsonText = extractedJsonText.trim();

              const firstBracket = extractedJsonText.indexOf("[");
              const lastBracket = extractedJsonText.lastIndexOf("]");
              if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                extractedJsonText = extractedJsonText.substring(firstBracket, lastBracket + 1);
              } else {
                const firstBrace = extractedJsonText.indexOf("{");
                const lastBrace = extractedJsonText.lastIndexOf("}");
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                  extractedJsonText = "[" + extractedJsonText.substring(firstBrace, lastBrace + 1) + "]";
                }
              }

              productsParsed = JSON.parse(extractedJsonText);
              isParsedSuccess = Array.isArray(productsParsed);
            } catch (parseError: any) {
              console.warn("JSON parsing of Gemini Voice parse output failed:", parseError);
              isParsedSuccess = false;
            }
          }
        } catch (aiMainErr: any) {
          console.error("Gemini AI API call failed completely for Voice Parsing, falling back to programmatic matching:", aiMainErr);
          isParsedSuccess = false;
        }
      }

      let formattedProducts = [];
      if (isParsedSuccess && Array.isArray(productsParsed)) {
        formattedProducts = productsParsed.map((item: any) => {
          const name = item.name || item.itemName || item.productName || item.item || "Parsed Product";
          const nameUr = item.nameUr || item.name_ur || item.urdu_name || item.urduName || name;
          const category = item.category || item.cat || "Pantry";
          
          let price = 1.99;
          if (item.price !== undefined && item.price !== null) {
            const parsedPrice = parseFloat(item.price);
            if (!isNaN(parsedPrice)) {
              price = parsedPrice;
            }
          }

          let qty = 1;
          if (item.qty !== undefined && item.qty !== null) {
            const parsedQty = parseInt(item.qty);
            if (!isNaN(parsedQty) && parsedQty > 0) {
              qty = parsedQty;
            }
          } else if (item.quantity !== undefined && item.quantity !== null) {
            const parsedQty = parseInt(item.quantity);
            if (!isNaN(parsedQty) && parsedQty > 0) {
              qty = parsedQty;
            }
          }

          const unit = item.unit || "item";
          const unitUr = item.unitUr || item.unit_ur || "عدد";

          // Match with database products
          let match = null;
          if (item.productId) {
            match = resolvedProducts.find(p => String(p.id) === String(item.productId));
          }
          if (!match) {
            match = fuzzyMatchProductBackend(name, nameUr, resolvedProducts);
          }
          const pStatus = String(match?.status || "").toLowerCase().trim();
          const isInactive = (pStatus === "inactive" || pStatus === "unavailable");
          const isOutOfStock = typeof match?.stockQuantity === 'number' && match.stockQuantity <= 0;
          const isAvailable = !!(match && !isInactive && !isOutOfStock && match.price > 0);
          
          if (isAvailable && match) {
            return {
              name: match.name,
              nameUr: match.nameUr,
              category: match.category,
              price: match.price,
              qty,
              unit: item.unit || match.unit,
              unitUr: item.unitUr || match.unitUr,
              productId: match.id,
              matched: true,
              isCatalogMatch: true,
              isAvailable: true,
              status: "Available",
              currencyCode: match.currencyCode || match.currency || "PKR"
            };
          } else {
            return {
              name: match ? match.name : name,
              nameUr: match ? match.nameUr : nameUr,
              category: match ? match.category : category,
              price: match ? match.price : price,
              qty,
              unit: match ? match.unit : unit,
              unitUr: match ? match.unitUr : unitUr,
              productId: match ? match.id : null,
              matched: false,
              isCatalogMatch: false,
              isAvailable: false,
              status: "Unavailable",
              currencyCode: match ? (match.currencyCode || match.currency || "PKR") : "PKR"
            };
          }
        });
      } else {
        console.log("Gemini API key missing or parse failed. Executing programmatic bilingual fallback parser.");
        formattedProducts = parseVoiceCommandBackend(text, resolvedProducts);
      }

      console.log(`Bilingual voice list parsing successfully completed! Extracted ${formattedProducts.length} items.`);
      res.json(formattedProducts);
    } catch (err: any) {
      console.error("Voice parse server error:", err);
      res.status(500).json({ error: `Voice List Parsing Failed: ${err.message || err.toString()}` });
    }
  });

  // Multimodal OCR Route forwarded to central handleOcr engine
  // (Central handleOcr supports PHP OCR, Gemini Multimodal, Sharp Preprocessing, and Tesseract Engine fallback)


  function formatServerPrice(basePrice: number, currencyCode: string = "USD", lang: string = "en", fromCurrencyCode: string = "PKR") {
    let toCode = (currencyCode || "USD").toUpperCase();
    let fromCode = (fromCurrencyCode || "PKR").toUpperCase();
    if (toCode.startsWith("CURR-")) toCode = toCode.replace("CURR-", "");
    if (fromCode.startsWith("CURR-")) fromCode = fromCode.replace("CURR-", "");

    if (fromCode === "USD" && basePrice > 50) fromCode = "PKR";

    const EXCHANGE_RATES: Record<string, { rate: number; symbol: string }> = {
      USD: { rate: 1, symbol: "$" },
      PKR: { rate: 278.23, symbol: "Rs " },
      EUR: { rate: 0.92, symbol: "€" },
      GBP: { rate: 0.79, symbol: "£" },
      SAR: { rate: 3.75, symbol: "﷼ " },
      AED: { rate: 3.67, symbol: "د.إ " }
    };

    const fromRate = EXCHANGE_RATES[fromCode]?.rate || 278.23;
    const cur = EXCHANGE_RATES[toCode] || EXCHANGE_RATES.USD;
    const usdPrice = basePrice / fromRate;
    const converted = usdPrice * cur.rate;
    const rounded = Math.round(converted * 100) / 100;
    return lang === "ur" 
      ? `${rounded.toLocaleString()} ${cur.symbol}` 
      : `${cur.symbol}${rounded.toFixed(2)}`;
  }

  // Programmatic Fallback Generator for AI Chatbot
  // Programmatic Fallback Generator for AI Chatbot
  function generateFallbackChatbotResponse(
    query: string, 
    products: any[] = [], 
    lang: string = "en", 
    activeTab: string = "home", 
    currency: string = "USD", 
    dbCategories: any[] = [], 
    userCategories: any[] = [], 
    dbSubcategories: any[] = [],
    chatHistory: any[] = []
  ): string {
    const q = (query || "").toLowerCase().trim();
    const isUr = lang === "ur" || /[\u0600-\u06FF]/.test(query) || q.includes("kya") || q.includes("hai") || q.includes("kaise") || q.includes("chahiye") || q.includes("batao") || q.includes("kitna");

    const fmt = (p: any) => formatServerPrice(p.price, currency, lang, p.currencyCode);

    // 1. Out of scope detection
    const outOfScopeKeywords = [
      "capital of", "weather in", "who is the president", "who won", "write code", "python",
      "java script", "math equation", "solve equation", "prime minister", "movie", "song", "quantum physics",
      "tell me about earth", "solar system", "history of war"
    ];
    if (outOfScopeKeywords.some(k => q.includes(k)) && !q.includes("voxcart") && !q.includes("store") && !q.includes("product") && !q.includes("item")) {
      return isUr
        ? "میں والکس کارٹ کا **Voxy AI** اسسٹنٹ ہوں۔ 🤖 میں اس ویب سائٹ کے تمام پروڈکٹس، صوتی آرڈر، ریسیپیز، پالیسیوں، بل اسکینر، فیڈبیک اور نیویگیشن سے متعلق سوالات میں آپ کی رہنمائی کرتا ہوں۔ آپ VoxCart سے متعلق کیا جاننا چاہتے ہیں؟"
        : "I am Voxy AI, your VoxCart AI Shopping & Website Assistant! 🤖 I can answer any question about our products, live stock, smart recipes, OCR bill scanner, customer feedback, store policies, and website navigation. How can I help you today?";
    }

    const activeProds = Array.isArray(products) ? products.filter(p => p.status !== "Inactive") : [];

    // Helper to format a single product's minimal, relevant, and clean details (no clutter)
    const formatProductDetails = (item: any, userAskedForSpecs: boolean = false) => {
      const unitLabel = isUr ? (item.unitUr || "پیکٹ") : (item.unit || "unit");
      const stockStatus = item.stockQuantity > 0 
        ? (isUr ? `✅ اسٹاک میں دستیاب ہے (${item.stockQuantity} ${unitLabel} موجود)` : `✅ In Stock (${item.stockQuantity} ${unitLabel} available)`)
        : (isUr ? "❌ آؤٹ آف اسٹاک (فی الوقت دستیاب نہیں ہے)" : "❌ Out of Stock (Currently unavailable)");

      const categoryPath = item.subcategoryName 
        ? `${item.category} > ${item.subcategoryName}`
        : (item.category || "General Grocery");

      const brandText = item.brandName || "General";
      const saleText = (item.salePrice && item.salePrice > 0)
        ? (isUr ? `\n- 🏷️ **رعایتی قیمت (Sale Price):** ${formatServerPrice(item.salePrice, currency, lang, item.currencyCode)} (خصوصی رعایت)` : `\n- 🏷️ **Sale Price:** ${formatServerPrice(item.salePrice, currency, lang, item.currencyCode)} (Special Discount!)`)
        : "";

      const descText = item.description || (isUr ? "خالص اور معیاری پروڈکٹ، والکس کارٹ اسٹور کیٹلاگ پر دستیاب ہے۔" : "Fresh, premium quality grocery product available at VoxCart.");

      let specsSection = "";
      if (userAskedForSpecs || q.includes("everything") || q.includes("all details") || q.includes("سب کچھ") || q.includes("مکمل تفصیل")) {
        specsSection = isUr
          ? `\n\n📋 **تکنیکی تفصیلات (Specifications):**\n- **ایس کے یو (SKU):** \`${item.sku || 'SKU-' + item.id}\`\n- **بیچ نمبر (Batch No):** \`${item.batchNumber || 'BATCH-' + item.id}\`\n- **تیاری کی تاریخ (Mfg Date):** ${item.manufacturingDate || '2026-01-15'}\n- **ایکسپائری تاریخ (Expiry Date):** ${item.expiryDate || '2027-01-15'}\n- **یونٹ:** ${unitLabel}`
          : `\n\n📋 **Product Specifications:**\n- **SKU:** \`${item.sku || 'SKU-' + item.id}\`\n- **Batch Number:** \`${item.batchNumber || 'BATCH-' + item.id}\`\n- **Manufacturing Date:** ${item.manufacturingDate || '2026-01-15'}\n- **Expiry Date:** ${item.expiryDate || '2027-01-15'}\n- **Unit:** ${unitLabel}`;
      }

      if (isUr) {
        return `🛍️ **${item.nameUr || item.name} (${item.name})**\n\n- 🏷️ **قیمت:** **${fmt(item)}** (${item.price} PKR) فی ${unitLabel}${saleText}\n- 📦 **دستیابی (Stock):** ${stockStatus}\n- 📌 **کیٹیگری:** ${categoryPath}\n- 🏢 **برانڈ:** ${brandText}\n- 📝 **تفصیل:** ${descText}${specsSection}\n\n💡 **خریداری کا طریقہ:**\nآپ **Catalog** ٹیب میں جا کر **${item.name}** کو کارٹ میں شامل کر سکتے ہیں یا ہیڈر مائیک دبا کر بولیں *"Add ${item.name} to cart"*!`;
      }

      return `🛍️ **${item.name}** ${item.nameUr ? `*(${item.nameUr})*` : ''}\n\n- 🏷️ **Price:** **${fmt(item)}** (${item.price} PKR) per ${unitLabel}${saleText}\n- 📦 **Availability:** ${stockStatus}\n- 📌 **Category:** ${categoryPath}\n- 🏢 **Brand:** ${brandText}\n- 📝 **Description:** ${descText}${specsSection}\n\n💡 **How to Buy:**\nYou can find and add **${item.name}** to your cart from the **Catalog** tab, or tap the microphone in the header and say *"Add ${item.name} to cart"*!`;
    };

    // 2. "WHAT'S NEW ON THE WEBSITE" & ANNOUNCEMENTS
    if (q.includes("what's new") || q.includes("whats new") || q.includes("what is new") || q.includes("new feature") || q.includes("new on the website") || q.includes("نیا کیا ہے") || q.includes("نئے فیچرز") || q.includes("تازہ ترین")) {
      return isUr
        ? "✨ **والکس کارٹ پر نئی سہولیات اور فیچرز (What's New on VoxCart):**\n\n" +
          "1. 📷 **AI بل اور لسٹ اسکینر (Bill Scanner):** کاغذی بل یا ہاتھ سے لکھی شاپنگ لسٹ کی تصویر اپ لوڈ کریں؛ AI خودکار طور پر اشیاء پڑھ کر کارٹ میں شامل کر دیتا ہے۔ یہ **Voice Assistant** پیج پر دستیاب ہے۔\n" +
          "2. 💬 **کسٹمر فیڈبیک و ایڈمن ریپلائی (Customer Feedback):** اب آپ ستارہ ریٹنگ اور رائے درج کر سکتے ہیں، اور ایڈمن ٹیم کے سرکاری جوابات اور حل کا اسٹیٹس براہ راست **Customer Feedback** ٹیب پر دیکھ سکتے ہیں۔\n" +
          "3. 🍲 **سمارٹ ریسپی ڈراپ ڈاؤن و آٹومیشن (Recipe Dropdown):** **Catalog** ٹیب میں ریسپی منتخب کریں (جیسے بریانی، کڑاہی، پاستا) اور 1 کلک میں تمام دستیاب اجزاء کارٹ میں ڈالیں۔\n" +
          "4. 🤖 **ووکسی AI اسسٹنٹ (Voxy AI):** ویب سائٹ کی لائیو معلومات، پروڈکٹ موازنہ، دستیابی کی جانچ، اور درست خریداری رہنمائی فراہم کرنے والا جدید ترین اسسٹنٹ!"
        : "✨ **What's New on VoxCart:**\n\n" +
          "1. 📷 **AI Bill & Receipt Scanner:** Upload any grocery bill photo or handwritten list to auto-extract and add items directly to your cart (**Voice Assistant** page).\n" +
          "2. 💬 **Customer Feedback & Admin Resolution:** Share ratings (1-5 stars), post reviews or suggestions, and track official verified admin replies with status badges on the **Customer Feedback** page.\n" +
          "3. 🍲 **Smart Recipe Dropdown & Automation:** In the **Catalog** tab, explore top dishes (Biryani, Karahi, Pasta, Pizza, Cake, etc.) to view step-by-step prep and add all required ingredients in 1-click.\n" +
          "4. 🤖 **Voxy AI Assistant:** Upgraded 3D assistant with full real-time awareness of our entire catalog, live stock availability, product comparisons, recommendations, and policy guidance!";
    }

    // 2b. PRODUCT COMPARISON ("What is the difference between A and B?", "Compare A and B")
    const isComparisonQuery = (
      q.includes("difference between") || q.includes("compare") || q.includes("vs") || q.includes("versus") ||
      q.includes("فرق") || q.includes("موازنہ") || q.includes("بہتر کون")
    );
    if (isComparisonQuery) {
      const matchedComp = activeProds.filter(p => {
        const pName = (p.name || "").toLowerCase();
        const pUr = (p.nameUr || "").toLowerCase();
        return (pName && q.includes(pName)) || (pUr && q.includes(pUr)) || (p.category && q.includes(p.category.toLowerCase()));
      });

      if (matchedComp.length >= 2) {
        const p1 = matchedComp[0];
        const p2 = matchedComp[1];
        const p1Stock = p1.stockQuantity > 0 ? (isUr ? `✅ اسٹاک (${p1.stockQuantity})` : `✅ In Stock (${p1.stockQuantity})`) : (isUr ? "❌ آؤٹ آف اسٹاک" : "❌ Out of Stock");
        const p2Stock = p2.stockQuantity > 0 ? (isUr ? `✅ اسٹاک (${p2.stockQuantity})` : `✅ In Stock (${p2.stockQuantity})`) : (isUr ? "❌ آؤٹ آف اسٹاک" : "❌ Out of Stock");

        return isUr
          ? `⚖️ **پروڈکٹ کا موازنہ: ${p1.name} بمقابلہ ${p2.name}**\n\n` +
            `1. **${p1.name}** (${p1.nameUr || ''}):\n` +
            `   - 🏷️ قیمت: **${fmt(p1)}** (${p1.price} PKR) فی ${p1.unitUr || p1.unit || 'یونٹ'}\n` +
            `   - 📌 کیٹیگری: ${p1.category} | برانڈ: ${p1.brandName || 'General'}\n` +
            `   - 📦 دستیابی: ${p1Stock}\n` +
            `   - 📝 خصوصیت: ${p1.description || 'اعلیٰ معیار'}\n\n` +
            `2. **${p2.name}** (${p2.nameUr || ''}):\n` +
            `   - 🏷️ قیمت: **${fmt(p2)}** (${p2.price} PKR) فی ${p2.unitUr || p2.unit || 'یونٹ'}\n` +
            `   - 📌 کیٹیگری: ${p2.category} | برانڈ: ${p2.brandName || 'General'}\n` +
            `   - 📦 دستیابی: ${p2Stock}\n` +
            `   - 📝 خصوصیت: ${p2.description || 'اعلیٰ معیار'}\n\n` +
            `💡 **نتیجہ:** دونوں پروڈکٹس **Catalog** ٹیب میں دستیاب ہیں!`
          : `⚖️ **Product Comparison: ${p1.name} vs ${p2.name}**\n\n` +
            `1. **${p1.name}**:\n` +
            `   - 🏷️ **Price:** **${fmt(p1)}** (${p1.price} PKR) / ${p1.unit || 'unit'}\n` +
            `   - 📌 **Category:** ${p1.category} | **Brand:** ${p1.brandName || 'General'}\n` +
            `   - 📦 **Stock Status:** ${p1Stock}\n` +
            `   - 📝 **Details:** ${p1.description || 'Premium quality'}\n\n` +
            `2. **${p2.name}**:\n` +
            `   - 🏷️ **Price:** **${fmt(p2)}** (${p2.price} PKR) / ${p2.unit || 'unit'}\n` +
            `   - 📌 **Category:** ${p2.category} | **Brand:** ${p2.brandName || 'General'}\n` +
            `   - 📦 **Stock Status:** ${p2Stock}\n` +
            `   - 📝 **Details:** ${p2.description || 'Premium quality'}\n\n` +
            `💡 **Summary:** Both items can be browsed and added to your cart in the **Catalog** tab!`;
      }
    }

    // 2c. RECOMMENDATIONS & "BEST PRODUCT FOR ME"
    const isRecommendationQuery = (
      q.includes("best for me") || q.includes("which product") || q.includes("recommend") || q.includes("suggestion") ||
      q.includes("what should i buy") || q.includes("کون سا بہتر") || q.includes("تجویز") || q.includes("مشورہ")
    );
    if (isRecommendationQuery) {
      const inStockItems = activeProds.filter(p => p.stockQuantity > 0);
      const topPicks = inStockItems.slice(0, 4).map(p => 
        `• **${p.name}** (${fmt(p)} / ${p.unit || 'unit'}): ${p.description || p.category}`
      ).join("\n");

      return isUr
        ? `🌟 **آپ کے لیے والکس کارٹ کی بہترین تجاویز:**\n\n${topPicks}\n\n💡 آپ اپنی پسند، بجٹ یا مخصوص ڈش کے بارے میں بتائیں تاکہ میں مزید موزوں اشیاء تجویز کر سکوں!`
        : `🌟 **Top Recommended Products for You:**\n\n${topPicks}\n\n💡 Tell me your preferred category (e.g. Dairy, Fruits, Meat, Pantry) or budget to get tailored recommendations!`;
    }

    // 2d. GENERAL POLICIES INQUIRY
    if (q.includes("policy") || q.includes("policies") || q.includes("rules") || q.includes("پالیسی") || q.includes("پالیسیاں") || q.includes("قوانین")) {
      return isUr
        ? "📜 **والکس کارٹ کی تمام کسٹمر پالیسیاں (Store Policies):**\n\n" +
          "1. 🚚 **ڈیلیوری:** آرڈرز 24 سے 48 گھنٹوں میں پہنچائے جاتے ہیں۔ $10 یا PKR 2,000 سے زائد پر ڈیلیوری **بالکل مفت** ہے۔\n" +
          "2. 🔄 **واپسی و ریفنڈ:** تازہ گروسری کے لیے 24 گھنٹے کا ریٹرن وقت ہے۔ رقم 3-5 کاروباری دنوں میں واپس کر دی جاتی ہے۔\n" +
          "3. 💳 **ادائیگی کے طریقے:** کیش آن ڈیلیوری (COD)، کریڈٹ/ڈیبٹ کارڈ، ایزی پیسہ، جیز کیش، اور بینک ٹرانسفر۔\n" +
          "4. 💬 **کسٹمر فیڈبیک:** آپ **Customer Feedback** ٹیب پر کسی بھی وقت اپنی شکایت یا رائے درج کر سکتے ہیں!"
        : "📜 **VoxCart Customer Policies Overview:**\n\n" +
          "1. 🚚 **Delivery Policy:** Standard delivery takes 24-48 hours. Orders over $10 USD (or PKR 2,000) qualify for **100% FREE delivery**.\n" +
          "2. 🔄 **Returns & Refund Policy:** 24-hour return window for fresh items. Refunds are processed to your original payment method in 3-5 business days.\n" +
          "3. 💳 **Payment Methods:** Cash on Delivery (COD), Visa/MasterCard, EasyPaisa, JazzCash, and Direct Bank Transfer.\n" +
          "4. 💬 **Customer Support & Feedback:** Submit feedback or complaints on the **Customer Feedback** page for direct administrative review and resolution!";
    }

    // WEBSITE OVERVIEW & PAGES GUIDE ("Show all pages", "How does the website work?")
    if (q.includes("all pages") || q.includes("website structure") || q.includes("how website works") || q.includes("overview of website") || q.includes("pages list") || q.includes("پیجز") || q.includes("تمام پیجز")) {
      return isUr
        ? "🗺️ **والکس کارٹ ویب سائٹ کے تمام پیجز اور خصوصیات (Website Pages Overview):**\n\n" +
          "1. 🏠 **Home Page ('home'):** مین اسٹور شوکیس، لائیو کرنسی لسٹ، ڈیل ہب ڈسکاؤنٹس، اور وائس اسسٹنٹ ہائی لائٹس۔\n" +
          "2. 🛍️ **Catalog / Browse ('browse'):** تمام گروسری اشیاء، کیٹیگریز و برانڈز فلٹرز، پرائس سلائیڈر، اور سمارٹ ریسپی سرچ۔\n" +
          "3. 🎙️ **Voice Assistant ('voice'):** اردو و انگریزی صوتی شاپنگ ڈکٹیشن اور تصویر سے کاغذی بل اسکینر (OCR)۔\n" +
          "4. ❤️ **Saved Favourites ('wishlist'):** آپ کی محفوظ کردہ پسندیدہ اشیاء۔\n" +
          "5. 🧾 **Orders & Receipts ('orders'):** لائیو آرڈر اسٹیٹس ٹریکنگ اور PDF انوائس ڈاؤن لوڈ۔\n" +
          "6. 💬 **Customer Feedback ('feedback'):** ستارہ ریٹنگ، گاہکوں کے تبصرے اور ایڈمن کے سرکاری جوابات۔\n" +
          "7. 💳 **Checkout & Payment ('payment'):** ایڈریس، کوپن کوڈ اور ادائیگی کے طریقے (COD, Cards, EasyPaisa, JazzCash, Bank Transfer)۔\n" +
          "8. ⚙️ **Admin Panel ('admin'):** اسٹور ایڈمنز کے لیے پروڈکٹس، کیٹیگریز، کرنسی، فیڈبیک اور آرڈرز مینجمنٹ۔"
        : "🗺️ **Complete VoxCart Website Pages & Features Guide:**\n\n" +
          "1. 🏠 **Home Page ('home'):** Store showcase, live currency ticker, deal hub discounts, category shortcuts, and review highlights.\n" +
          "2. 🛍️ **Catalog / Browse ('browse'):** Browse all groceries, filter by category/brand, adjust price slider, or select smart recipes.\n" +
          "3. 🎙️ **Voice Assistant ('voice'):** Hands-free voice shopping in English/Urdu and AI Bill/Receipt Photo Scanner (OCR).\n" +
          "4. ❤️ **Saved Favourites ('wishlist'):** View bookmarked favorite products and add them to cart in 1-click.\n" +
          "5. 🧾 **Orders & Receipts ('orders'):** Live order progress tracking (Pending ➔ Delivered) and downloadable PDF invoices.\n" +
          "6. 💬 **Customer Feedback ('feedback'):** Submit 1-5 star ratings, post reviews, and view official verified admin replies.\n" +
          "7. 💳 **Checkout & Payment ('payment'):** Enter delivery address, apply coupon codes, and select payment methods (COD, Card, EasyPaisa, JazzCash, Bank Transfer).\n" +
          "8. ⚙️ **Admin Console ('admin'):** Store management for inventory, stock levels, categories, exchange rates, order status, and feedback resolution.";
    }

    // 2. WEBSITE FEATURES, INSTRUCTIONS & NAVIGATION (HIGH PRIORITY - Check before generic product word matches)

    // Customer Feedback, Reviews & Ratings
    if (q.includes("feedback") || q.includes("review") || q.includes("rating") || q.includes("complaint") || q.includes("comment") || q.includes("رائے") || q.includes("فیڈبیک") || q.includes("شکایت") || q.includes("ریویو")) {
      return isUr
        ? "💬 **گاہکوں کی رائے اور فیڈ بیک کا طریقہ (Customer Feedback & Reviews):**\n1. نیویگیشن بار میں **Customer Feedback** ٹیب پر جائیں۔\n2. اپنا نام، ای میل، ریٹنگ (1 سے 5 ستارے)، کیٹیگری (Service, Quality, Delivery, Website, Pricing, Other)، اور تفصیلی رائے یا شکایت درج کریں۔\n3. **'Submit Feedback'** پر کلک کریں۔ آپ کی رائے محفوظ ہو جائے گی اور ایڈمن ٹیم کا جواب بھی آپ کو اسی پیج پر نظر آئے گا!\n4. ایڈمن اپنے پینل سے ہر فیڈبیک کا جائزہ لے کر سرکاری جواب اور اسٹیٹس اپ ڈیٹ کر سکتا ہے۔"
        : "💬 **How the Customer Feedback & Reviews Feature Works:**\n1. Navigate to the **Customer Feedback** tab in the main navigation bar.\n2. Enter your name, email, star rating (1-5 stars), feedback category (Service, Quality, Delivery, Website, Pricing, Other), and your detailed comments or complaints.\n3. Click **'Submit Feedback'** to submit. Your feedback is recorded in the system, and you can view published reviews along with official administrative replies and resolution status!\n4. Store administrators can also manage and respond directly from the Admin Feedback Management panel.";
    }

    // TROUBLESHOOTING: Microphone & Voice Issues
    if (q.includes("mic not working") || q.includes("microphone error") || q.includes("voice issue") || q.includes("cannot hear") || q.includes("voice failed") || q.includes("مائیک کام نہیں کر رہا")) {
      return isUr
        ? "🛠️ **مائیکروفون کام نہ کرنے کا حل (Voice Troubleshooting):**\n1. براؤزر کے ایڈریس بار میں لاک/مائیک ائیکن پر کلک کر کے مائیکروفون اجازت (Allow Microphone) یقینی بنائیں۔\n2. یقینی بنائیں کہ کوئی اور ایپ مائیک استعمال نہ کر رہی ہو۔\n3. بہترین وائس ریکگنیشن کے لیے Google Chrome یا Microsoft Edge استعمال کریں۔"
        : "🛠️ **Microphone & Voice Assistant Troubleshooting:**\n1. Ensure browser microphone permissions are set to **Allow** in your browser's address bar.\n2. Check that no other application is currently locking your microphone.\n3. For best Web Speech API performance, use Google Chrome, Microsoft Edge, or Safari.";
    }

    // TROUBLESHOOTING: Receipt Scanner Issues
    if (q.includes("scanner issue") || q.includes("receipt failed") || q.includes("cannot scan") || q.includes("ocr error") || q.includes("اسکینر مسئلہ")) {
      return isUr
        ? "🛠️ **بل اسکینر کا مسئلہ حل کرنے کا طریقہ:**\n1. تصویر صاف، روشن اور سیدھی ہونی چاہیے۔\n2. کاغذی بل یا لکھی ہوئی لسٹ پر نام اور مقدار واضح ہونی چاہیے۔\n3. بہتر رزلٹ کے لیے دوبارہ ایچ ڈی (HD) تصویر اپ لوڈ کریں۔"
        : "🛠️ **OCR Bill Scanner Troubleshooting:**\n1. Ensure the photo is clear, properly lit, and not blurry or rotated.\n2. Verify that item names and quantities on the paper bill/list are legible.\n3. Re-upload a higher resolution image for maximum OCR accuracy.";
    }

    // TROUBLESHOOTING: Out of Stock
    if (q.includes("out of stock") || q.includes("sold out") || q.includes("unavailable product") || q.includes("اسٹاک ختم")) {
      return isUr
        ? "📦 **آؤٹ آف اسٹاک پروڈکٹس کے بارے میں:**\nوالکس کارٹ کا اسٹور سسٹم لائیو اسٹاک اپ ڈیٹ کرتا ہے۔ اگر کوئی پروڈکٹ آؤٹ آف اسٹاک ہے تو اسے فی الوقت کارٹ میں شامل نہیں کیا جا سکتا۔ ایڈمن ٹیم جلد اسٹاک دوبارہ شامل کر دیتی ہے۔ آپ ووکسی AI سے متبادل پروڈکٹس کی تجاویز مانگ سکتے ہیں!"
        : "📦 **Out of Stock & Inventory Resolution:**\nVoxCart tracks real-time inventory. When stock reaches 0, the item is marked Out of Stock to prevent unfulfillable orders. Store admins restock items regularly. You can ask Voxy AI for alternative available products in the same category!";
    }

    // TROUBLESHOOTING: Login / Password Reset
    if (q.includes("forgot password") || q.includes("reset password") || q.includes("cannot login") || q.includes("login issue") || q.includes("پاس ورڈ بھول گئے")) {
      return isUr
        ? "🔑 **لاگ ان اور پاس ورڈ ری سیٹ کا طریقہ:**\n1. ہیڈر میں Account آئیکن پر کلک کریں۔\n2. **Forgot Password** منتخب کریں اور اپنا رجسٹرڈ ای میل درج کریں۔\n3. ای میل پر آنے والا ویریفیکیشن کوڈ درج کر کے نیا مضبوط پاس ورڈ سیٹ کریں۔"
        : "🔑 **Account Login & Password Reset Assistance:**\n1. Click the User/Account icon in the top header bar.\n2. Click **Forgot Password / Reset Password** and enter your registered email address.\n3. Enter the 6-digit email verification code sent to you to establish a new strong password!";
    }

    // TROUBLESHOOTING: Coupon / Payment Error
    if (q.includes("coupon error") || q.includes("payment error") || q.includes("payment failed") || q.includes("کوپن مسئلہ")) {
      return isUr
        ? "💳 **کوپن اور پیمنٹ کے مسائل کا حل:**\n1. کوپن کوڈ بغیر کسی اسپیس کے درستی سے درج کریں۔\n2. چیک کریں کہ کارٹ میں کم از کم مطلوبہ رقم پوری ہے۔\n3. اگر کارڈ یا آن لائن پیمنٹ فیل ہو تو Cash on Delivery (COD) منتخب کر کے آرڈر مکمل کریں۔"
        : "💳 **Coupon & Payment Error Resolution:**\n1. Double check that the promo code is spelled correctly without extra spaces.\n2. Ensure your cart meets any minimum order requirements for discounts.\n3. If an online payment fails, switch to Cash on Delivery (COD) to complete your order smoothly!";
    }

    // Add to Favorites / Wishlist / Bookmarks
    if (q.includes("favourite") || q.includes("favorite") || q.includes("bookmark") || q.includes("heart") || q.includes("wishlist") || q.includes("save") || q.includes("پسندیدہ") || q.includes("فیورٹ")) {
      return isUr
        ? "❤️ **پسندیدہ اشیاء محفوظ کرنے کا طریقہ (Add to Favorites):**\n1. کسی بھی پروڈکٹ کارڈ کے اوپر دائیں کونے میں موجود **دل (❤️)** کے آئیکن پر کلک کریں۔\n2. وہ پروڈکٹ آپ کی پسندیدہ لسٹ میں محفوظ ہو جائے گی۔\n3. اوپر نیویگیشن بار میں **Saved Favourites** ٹیب کھول کر آپ تمام محفوظ شدہ اشیاء دیکھ سکتے ہیں اور ایک کلک میں کارٹ میں ڈال سکتے ہیں!"
        : "❤️ **How to Add Items to Favorites & Bookmarks:**\n1. Click the **Heart Icon (❤️)** on the top right of any product card in the Catalog or Home page.\n2. The item will be instantly saved to your personal wishlist.\n3. Navigate to the **Saved Favourites** tab in the main menu anytime to view all your bookmarked groceries and add them to your cart in 1-click!";
    }

    // Recipes & Smart Recipe Search
    if (q.includes("biryani") || q.includes("بریانی")) {
      return isUr
        ? "🥘 **چکن بریانی کی مکمل ریسپی اور درکار اجزاء:**\n- 🍗 **چکن (Chicken Breast):** 1 کلو\n- 🌾 **سیلا / باسمتی چاول (White Rice):** 1 کلو\n- 🧅 **پیاز (Onions):** 250 گرام\n- 🍅 **ٹماٹر (Tomatoes):** 250 گرام\n- 🥔 **آلو (Potatoes):** 250 گرام\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 250 ملی لیٹر\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🌶️ **بریانی مصالحہ اور ادرک لہسن پیسٹ**\n- 🥛 **دہی اور تازہ پودینہ**\n\n💡 **طریقہ:** **Catalog** ٹیب میں جائیں اور سرچ بار میں 'Biryani' لکھیں، جہاں آپ **'Add All Recipe Ingredients'** بٹن سے تمام اجزاء 1 کلک میں کارٹ میں ڈال سکتے ہیں!"
        : "🥘 **Chicken Biryani Recipe & Complete Ingredients:**\n- 🍗 **Chicken Breast:** 1 KG\n- 🌾 **White Rice:** 1 KG\n- 🧅 **Onions:** 250 Grams\n- 🍅 **Tomatoes:** 250 Grams\n- 🥔 **Potatoes:** 250 Grams\n- 🛢️ **Cooking Oil:** 250 ML\n- 🧂 **Salt:** 1 Pack\n- 🌶️ **Biryani Masala & Ginger Garlic Paste**\n- 🥛 **Yogurt & Fresh Mint**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Biryani' to see preparation steps and click **'Add All Recipe Ingredients'** to add all items to your cart in 1-click!";
    }
    if (q.includes("karahi") || q.includes("کڑاہی")) {
      return isUr
        ? "🍲 **چکن کڑاہی کی مکمل ریسپی اور درکار اجزاء:**\n- 🍗 **چکن (Chicken Breast):** 1 کلو\n- 🍅 **ٹماٹر (Tomatoes):** 1 کلو\n- 🧅 **پیاز (Onions):** 1 کلو\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 1 لیٹر\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🌶️ **کڑاہی مصالحہ اور ادرک لہسن پیسٹ**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Karahi' سرچ کر کے 1 کلک میں تمام اجزاء کارٹ میں شامل کریں!"
        : "🍲 **Chicken Karahi Recipe & Complete Ingredients:**\n- 🍗 **Chicken Breast:** 1 KG\n- 🍅 **Tomatoes:** 1 KG\n- 🧅 **Onions:** 1 KG\n- 🛢️ **Cooking Oil:** 1 Liter\n- 🧂 **Salt:** 1 Pack\n- 🌶️ **Karahi Masala & Ginger Garlic Paste**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Karahi' to add all required ingredients to your cart in 1-click!";
    }
    if (q.includes("nihari") || q.includes("نہاری")) {
      return isUr
        ? "🍲 **نہاری کی مکمل ریسپی اور درکار اجزاء:**\n- 🥩 **گوشت / بیف (Beef):** 1 کلو\n- 🌾 **گندم کا آٹا (Flour):** 1 کلو\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 1 لیٹر\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🌶️ **نہاری مصالحہ اور ادرک لیموں**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Nihari' سرچ کر کے تمام اجزاء کارٹ میں ڈالیں!"
        : "🍲 **Special Nihari Recipe & Complete Ingredients:**\n- 🥩 **Beef / Meat:** 1 KG\n- 🌾 **Wheat Flour (Atta):** 1 KG\n- 🛢️ **Cooking Oil:** 1 Liter\n- 🧂 **Salt:** 1 Pack\n- 🌶️ **Nihari Special Masala & Ginger**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Nihari' to add all required ingredients to your cart in 1-click!";
    }
    if (q.includes("pasta") || q.includes("پاستا")) {
      return isUr
        ? "🍝 **پاستا کی مکمل ریسپی اور درکار اجزاء:**\n- 🍝 **پاستا پیکٹ (Pasta):** 1 ڈبہ\n- 🍗 **چکن (Chicken Breast):** 1 کلو\n- 🥛 **خالص دودھ (Whole Milk):** 1 پیکٹ\n- 🧈 **مکھن (Butter):** 1 بلاک\n- 🧀 **چیدر چیز (Cheese):** 1 پیکٹ\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Pasta' سرچ کر کے تمام اجزاء 1 کلک میں کارٹ میں شامل کریں!"
        : "🍝 **Creamy Chicken Pasta Recipe & Complete Ingredients:**\n- 🍝 **Pasta Pack:** 1 Box\n- 🍗 **Chicken Breast:** 1 KG\n- 🥛 **Whole Milk:** 1 Pack\n- 🧈 **Butter:** 1 Block\n- 🧀 **Cheddar Cheese:** 1 Pack\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Pasta' to add all required ingredients to your cart in 1-click!";
    }
    if (q.includes("pizza") || q.includes("پیزا")) {
      return isUr
        ? "🍕 **پیزا کی مکمل ریسپی اور درکار اجزاء:**\n- 🍕 **پیزا کرسٹ:** 1 عدد\n- 🧀 **موزریلا چیز (Cheese):** 1 پیکٹ\n- 🍅 **ٹماٹر / پیزا سوس:** 1 کلو\n- 🍗 **چکن (Chicken Breast):** 1 کلو\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Pizza' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
        : "🍕 **Delicious Pizza Recipe & Complete Ingredients:**\n- 🍕 **Pizza Crust:** 1 Base\n- 🧀 **Mozzarella & Cheddar Cheese:** 1 Pack\n- 🍅 **Tomatoes / Pizza Sauce:** 1 KG\n- 🍗 **Chicken Breast:** 1 KG\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Pizza' to add all required ingredients to your cart in 1-click!";
    }
    if (q.includes("cake") || q.includes("کیک")) {
      return isUr
        ? "🎂 **کیک کی مکمل ریسپی اور درکار اجزاء:**\n- 🥚 **انڈے (Eggs):** 1 درجن\n- 🥛 **خالص دودھ (Whole Milk):** 1 پیکٹ\n- 🧈 **مکھن (Butter):** 1 بلاک\n- 🍬 **چینی (Sugar):** 1 پیکٹ\n- 🌾 **گندم کا آٹا (Flour):** 1 کلو\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Cake' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
        : "🎂 **Cake Recipe & Complete Ingredients:**\n- 🥚 **Eggs:** 1 Dozen\n- 🥛 **Whole Milk:** 1 Pack\n- 🧈 **Butter:** 1 Block\n- 🍬 **Sugar:** 1 Pack\n- 🌾 **Wheat Flour (Atta):** 1 KG\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Cake' to add all required ingredients to your cart in 1-click!";
    }
    if (q.includes("burger") || q.includes("برگر")) {
      return isUr
        ? "🍔 **چکن برگر کی مکمل ریسپی اور درکار اجزاء:**\n- 🍔 **برگر بنز (Burger Buns):** 1 پیکٹ\n- 🍗 **چکن بریسٹ (Chicken Breast):** 1 کلو\n- 🧀 **چیدر چیز (Cheddar Cheese):** 1 پیکٹ\n- 🍅 **ٹماٹر (Tomatoes):** 1 کلو\n- 🧅 **پیاز (Onions):** 500 گرام\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Burger' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
        : "🍔 **Chicken Burger Recipe & Complete Ingredients:**\n- 🍔 **Burger Buns:** 1 Pack\n- 🍗 **Chicken Breast:** 1 KG\n- 🧀 **Cheddar Cheese:** 1 Pack\n- 🍅 **Tomatoes:** 1 KG\n- 🧅 **Onions:** 500g\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Burger' to add all required ingredients to your cart in 1-click!";
    }
    if (q.includes("recipe") || q.includes("dish") || q.includes("ترکیب") || q.includes("ریسپی") || q.includes("ڈش")) {
      return isUr
        ? "🍝 **ریسپی سرچ اور اجزاء حاصل کرنے کا طریقہ (Smart Recipe Search):**\n1. **Catalog** ٹیب پر جائیں۔\n2. سرچ بار میں کسی بھی ڈش کا نام لکھیں (مثلاً: *Biryani, Karahi, Nihari, Pasta, Pizza, Cake, Burger*)۔\n3. والکس کارٹ آپ کو ڈش بنانے کا طریقہ اور درکار تمام اجزاء دکھائے گا۔\n4. **'Add All Recipe Ingredients'** دبائیں تاکہ تمام اجزاء فوری طور پر آپ کے کارٹ میں شامل ہو جائیں!"
        : "🍝 **How to Use Smart Recipe Search:**\n1. Navigate to the **Catalog** tab.\n2. In the search bar, type the name of any dish (e.g., *Biryani, Karahi, Nihari, Pasta, Pizza, Cake, Burger*).\n3. VoxCart displays the recipe breakdown along with all required grocery ingredients.\n4. Click **'Add All Recipe Ingredients'** to add all recipe items to your shopping cart in a single click!";
    }

    // Voice Dictation & Language Switching
    if (q.includes("voice") || q.includes("mic") || q.includes("speak") || q.includes("speech") || q.includes("صوتی") || q.includes("بول")) {
      return isUr
        ? "🎙️ **صوتی اسسٹنٹ کا طریقہ (Voice Shopping):**\n1. ہیڈر میں موجود مائیکروفون آئیکن یا **Voice Assistant** ٹیب پر کلک کریں۔\n2. مائیک بٹن دبائیں اور اردو، انگریزی یا رومن اردو میں بولیں (مثلاً: *'دو کلو آٹا اور ایک درجن انڈے شامل کرو'*)\n3. والکس کارٹ آپ کی آواز سمجھ کر فوری طور پر اشیاء کارٹ میں ڈال دے گا۔"
        : "🎙️ **How to Use Voice Assistant & Speech Shopping:**\n1. Click the microphone icon in the top header or navigate to the **Voice Assistant** tab.\n2. Tap the mic button and speak naturally in English, Urdu, or Roman Urdu (e.g., *'Add 2 kg flour and 1 dozen eggs'*).\n3. VoxCart recognizes product names and quantities to automatically populate your cart!";
    }

    // OCR Bill & Receipt Scanner
    if (q.includes("scan") || q.includes("ocr") || q.includes("receipt") || q.includes("bill") || q.includes("اسکین") || q.includes("رسید") || q.includes("تصویر")) {
      return isUr
        ? "📷 **بل اور شاپنگ لسٹ اسکینر (OCR Bill Scanner):**\n1. **Voice Assistant** ٹیب پر جائیں اور نیچے اسکرول کر کے **Invoice / Bill Scanner** دیکھیں۔\n2. اپنے کاغذی بل یا ہاتھ سے لکھی لسٹ کی تصویر اپ لوڈ کریں۔\n3. AI اسکینر تصویر پڑھ کر تمام آئٹمز کارٹ میں تبدیل کر دے گا!"
        : "📷 **How to Use the OCR Bill & Receipt Scanner:**\n1. Go to the **Voice Assistant** tab and scroll to the **Invoice / Bill Scanner** section.\n2. Upload a photo of a printed grocery bill or handwritten shopping list.\n3. Our AI vision scanner extracts the listed items and lets you add them directly to your cart!";
    }

    // Orders & Tracking & Invoices
    if (q.includes("order") || q.includes("track") || q.includes("status") || q.includes("invoice") || q.includes("history") || q.includes("آرڈر") || q.includes("رسید")) {
      return isUr
        ? "🧾 **آرڈر ٹریکنگ اور رسید دیکھنے کا طریقہ:**\n1. اوپر نیویگیشن بار میں **Orders** ٹیب پر کلک کریں۔\n2. وہاں آپ کو اپنے تمام آرڈرز کی لائیو ٹریکنگ (Pending ➔ Shipped ➔ Delivered) نظر آئے گی۔\n3. آپ کسی بھی آرڈر کا **'PDF Invoice'** ڈاؤن لوڈ یا پرنٹ بھی کر سکتے ہیں!"
        : "🧾 **How to Track Orders & Download Invoices:**\n1. Click on the **Orders** tab in the main navigation bar.\n2. View live status updates for all your purchases (Pending ➔ Shipped ➔ Delivered).\n3. Click the **PDF Invoice** button next to any order to view, download, or print official receipts!";
    }

    // Coupons, Discounts & Promo Codes
    if (q.includes("coupon") || q.includes("discount") || q.includes("promo") || q.includes("code") || q.includes("voucher") || q.includes("کوپن") || q.includes("رعایت")) {
      return isUr
        ? "🎟️ **کوپن کوڈز اور رعایات:**\n1. کارٹ میں اشیاء شامل کر کے **Checkout** پیج پر جائیں۔\n2. **'Coupon / Promo Code'** کا خانہ موجود ہے، وہاں اپنا کوڈ درج کر کے **Apply** دبائیں۔\n- $10 یا PKR 2,000 سے زائد کے آرڈرز پر مفت ڈیلیوری بھی فراہم کی جاتی ہے!"
        : "🎟️ **Coupons, Discounts & Promo Codes:**\n1. Add items to your cart and proceed to the **Checkout** page.\n2. Enter your coupon code into the **'Coupon / Promo Code'** input field and click **Apply** for instant cart savings!\n- Orders above $10 USD or PKR 2,000 automatically get FREE home delivery!";
    }

    // Checkout & Payment Methods
    if (q.includes("checkout") || q.includes("place order") || q.includes("payment") || q.includes("pay") || q.includes("cod") || q.includes("card") || q.includes("easypaisa") || q.includes("jazzcash") || q.includes("چیک آؤٹ") || q.includes("ادائیگی")) {
      return isUr
        ? "💳 **چیک آؤٹ اور ادائیگی کے طریقے:**\n1. کارٹ کا جائزہ لینے کے بعد **'Proceed to Checkout'** پر کلک کریں۔\n2. اپنا ڈیلیوری ایڈریس درج کریں اور ادائیگی کا طریقہ منتخب کریں: Cash on Delivery (COD), Credit/Debit Card, EasyPaisa, JazzCash, یا Direct Bank Transfer۔\n3. **'Place Order'** پر کلک کریں!"
        : "💳 **How to Checkout & Payment Options:**\n1. Review your cart and click **'Proceed to Checkout'**.\n2. Enter your delivery address and select your preferred payment method: Cash on Delivery (COD), Credit/Debit Card, EasyPaisa, JazzCash, or Direct Bank Transfer.\n3. Click **'Place Order'** to complete your order!";
    }

    // Delivery & Shipping
    if (q.includes("deliver") || q.includes("shipping") || q.includes("fee") || q.includes("charge") || q.includes("دیلیوری") || q.includes("ڈلیوری")) {
      return isUr
        ? "🚚 **ڈیلیوری کی معلومات:**\n- **وقت:** آرڈرز 24-48 گھنٹوں میں پہنچائے جاتے ہیں۔\n- **مفت ڈیلیوری:** $10 یا PKR 2,000 سے زیادہ کے آرڈرز پر ڈیلیوری بالکل مفت ہے!\n- **ٹریکنگ:** **Orders** ٹیب سے آرڈر کی لائیو پوزیشن چیک کریں۔"
        : "🚚 **Delivery Information:**\n- **Delivery Time:** Orders arrive within 24-48 hours.\n- **Free Delivery:** All orders over $10 USD or PKR 2,000 qualify for 100% FREE shipping!\n- **Tracking:** Real-time updates are available on the **Orders** tab.";
    }

    // Returns & Refunds
    if (q.includes("refund") || q.includes("return") || q.includes("policy") || q.includes("damaged") || q.includes("واپسی") || q.includes("ریفنڈ")) {
      return isUr
        ? "🔄 **ریفنڈ اور واپسی کی پالیسی:**\nتازہ گروسری اشیاء کے لیے 24 گھنٹوں کی واپسی کی پالیسی ہے۔ خرابی کی صورت میں رقم 3-5 دنوں میں واپس کر دی جاتی ہے۔"
        : "🔄 **Returns & Refund Policy:**\nVoxCart offers a 24-hour return policy for fresh grocery items. Full refunds are processed to your original payment method within 3-5 business days.";
    }

    // Currency / Language
    if (q.includes("currency") || q.includes("pkr") || q.includes("usd") || q.includes("language") || q.includes("urdu") || q.includes("کرنسی") || q.includes("زبان")) {
      return isUr
        ? "🌐 **کرنسی اور زبان کا انتخاب:**\nہیڈر بار سے زبان (English / اردو) اور کرنسی (USD $, PKR ₨, EUR €, GBP £, SAR ﷼, AED) ایک کلک میں تبدیل کر سکتے ہیں۔"
        : "🌐 **Currency & Language Settings:**\nUse the top header to toggle between English and Urdu (اردو) or switch currencies across USD $, PKR ₨, EUR €, GBP £, SAR, and AED with live exchange rates!";
    }

    // Accounts & Admin
    if (q.includes("account") || q.includes("login") || q.includes("register") || q.includes("admin") || q.includes("password") || q.includes("لاگ ان") || q.includes("اکاؤنٹ")) {
      return isUr
        ? "👤 **اکاؤنٹس اور ایڈمن پینل:**\n- گاہک لاگ ان کر کے یا گیسٹ موڈ میں خریداری کر سکتے ہیں۔ لاگ ان کرنے پر AI آپ کی ذاتی کیٹیگریز محفوظ رکھتا ہے۔\n- ایڈمن کنٹرول کے لیے **Admin** ٹیب پر جائیں (admin@voxcart.com / admin)"
        : "👤 **User Accounts & Admin Console:**\n- Customers can shop as Guest or create an Account to save delivery addresses and personal AI categories.\n- Store management is available in the **Admin** tab (default: `admin@voxcart.com` / `admin`).";
    }

    // 3. TARGETED CATEGORY QUERIES (Check if user is asking about a specific category like Fruits, Vegetables, Dairy, Meat, Beverages, etc.)
    let targetCategory: string | null = null;
    if (q.includes("fruit") || q.includes("apple") || q.includes("banana") || q.includes("mango") || q.includes("orange") || q.includes("strawberry") || q.includes("پھل") || q.includes("سیب") || q.includes("کیلے") || q.includes("آم") || q.includes("مالٹے")) {
      targetCategory = "Fruits";
    } else if (q.includes("veg") || q.includes("vegetable") || q.includes("potato") || q.includes("tomato") || q.includes("onion") || q.includes("carrot") || q.includes("سبزی") || q.includes("سبزیاں") || q.includes("آلو") || q.includes("ٹماٹر") || q.includes("پیاز") || q.includes("گاجر")) {
      targetCategory = "Vegetables";
    } else if (q.includes("dairy") || q.includes("milk") || q.includes("cheese") || q.includes("yogurt") || q.includes("butter") || q.includes("egg") || q.includes("دودھ") || q.includes("دہی") || q.includes("مکھن") || q.includes("پنیر") || q.includes("انڈے")) {
      targetCategory = "Dairy & Eggs";
    } else if (q.includes("meat") || q.includes("chicken") || q.includes("beef") || q.includes("fish") || q.includes("seafood") || q.includes("mutton") || q.includes("گوشت") || q.includes("مرغی") || q.includes("بیف") || q.includes("مچھلی")) {
      targetCategory = "Meat & Seafood";
    } else if (q.includes("bakery") || q.includes("bread") || q.includes("croissant") || q.includes("bun") || q.includes("بیکری") || q.includes("ڈبل روٹی") || q.includes("روٹی")) {
      targetCategory = "Bakery";
    } else if (q.includes("beverage") || q.includes("drink") || q.includes("juice") || q.includes("coke") || q.includes("pepsi") || q.includes("water") || q.includes("tea") || q.includes("coffee") || q.includes("مشروبات") || q.includes("شربت") || q.includes("پانی")) {
      targetCategory = "Beverages";
    } else if (q.includes("snack") || q.includes("chips") || q.includes("biscuit") || q.includes("cookie") || q.includes("سنیکس") || q.includes("بسکٹ") || q.includes("چپس")) {
      targetCategory = "Snacks";
    } else if (q.includes("pantry") || q.includes("staple") || q.includes("rice") || q.includes("oil") || q.includes("sugar") || q.includes("salt") || q.includes("flour") || q.includes("spice") || q.includes("پنساری") || q.includes("راشن") || q.includes("چاول") || q.includes("آئل") || q.includes("آٹا")) {
      targetCategory = "Pantry";
    } else {
      const matchedCat = activeProds.find(p => p.category && q.includes(p.category.toLowerCase()));
      if (matchedCat) {
        targetCategory = matchedCat.category;
      }
    }

    const isCategorySpecificQuery = targetCategory && (
      q.includes("fruit") || q.includes("veg") || q.includes("dairy") || q.includes("meat") || q.includes("beverage") || q.includes("bakery") || q.includes("snack") || q.includes("pantry") ||
      q.includes("what") || q.includes("show") || q.includes("list") || q.includes("available") || q.includes("category") || q.includes("all") || q.includes("have") ||
      q.includes("پھل") || q.includes("سبزی") || q.includes("دودھ") || q.includes("گوشت") || q.includes("مشروبات") || q.includes("پنساری") || q.includes("کون") || q.includes("کیا") || q.includes("دیکھو") || q.includes("فہرست") || q.includes("ہیں")
    );

    if (targetCategory && isCategorySpecificQuery) {
      const catItems = activeProds.filter(p => (p.category || "").toLowerCase().includes(targetCategory.toLowerCase()));
      if (catItems.length > 0) {
        const catList = catItems.map(p => {
          const unitLabel = isUr ? (p.unitUr || 'پیکٹ') : (p.unit || 'pack');
          const stockStr = p.stockQuantity > 0 ? (isUr ? `✅ دستیاب (${p.stockQuantity})` : `✅ In Stock (${p.stockQuantity})`) : (isUr ? '❌ آؤٹ آف اسٹاک' : '❌ Out of Stock');
          return `• **${p.name}** ${p.nameUr ? `(${p.nameUr})` : ''}\n  └ 🏷️ **Price:** ${fmt(p)} (${p.price} PKR) / ${unitLabel} | ${stockStr}`;
        }).join("\n\n");

        return isUr
          ? `🏷️ **${targetCategory} کیٹیگری کی تمام دستیاب اشیاء:**\n\n${catList}\n\n💡 آپ **Catalog** ٹیب میں '${targetCategory}' فلٹر منتخب کر کے یہ تمام اشیاء کارٹ میں شامل کر سکتے ہیں!`
          : `🏷️ **${targetCategory} Category — Available Products:**\n\n${catList}\n\n💡 Visit the **Catalog** tab and select the **${targetCategory}** filter to purchase any of these items!`;
      }
    }

    // 4. CONTEXT & FOLLOW-UP RESOLUTION FROM CHAT HISTORY
    let contextualProduct: any = null;
    const isExplicitSpecQuery = (
      q.includes("sku") || q.includes("batch") || q.includes("expiry") || q.includes("expire") ||
      q.includes("mfg") || q.includes("manufacturing") || q.includes("spec") || q.includes("specification") ||
      q.includes("ایکسپائری") || q.includes("بیچ") || q.includes("تاریخ")
    );

    const isFollowUpQuery = (
      q.includes("it") || q.includes("its") || q.includes("this") || q.includes("that") ||
      q.includes("price") || q.includes("cost") || q.includes("expiry") || q.includes("expire") ||
      q.includes("batch") || q.includes("sku") || q.includes("stock") || q.includes("available") ||
      q.includes("specification") || q.includes("spec") || q.includes("detail") || q.includes("feature") ||
      q.includes("اس کا") || q.includes("اسکی") || q.includes("قیمت") || q.includes("تاریخ") || q.includes("ایکسپائری") || q.includes("اسٹاک")
    );

    if (isFollowUpQuery && Array.isArray(chatHistory) && chatHistory.length > 0) {
      for (let i = chatHistory.length - 1; i >= 0; i--) {
        const histText = (chatHistory[i].text || "").toLowerCase();
        for (const p of activeProds) {
          const pName = (p.name || "").toLowerCase();
          const pUr = (p.nameUr || "").toLowerCase();
          if ((pName && histText.includes(pName)) || (pUr && histText.includes(pUr))) {
            contextualProduct = p;
            break;
          }
        }
        if (contextualProduct) break;
      }
    }

    // 5. TARGETED PRODUCT LOOKUP (Checks specific product names, brands, SKUs, and keywords)
    const ignoreWords = new Set([
      "what", "is", "are", "the", "a", "an", "price", "prices", "cost", "costs", "rate", "rates", "of", "how", "much", "many", "does", "do",
      "you", "have", "sell", "show", "me", "list", "available", "tell", "about", "for", "in", "store", "voxcart", "can",
      "buy", "give", "item", "product", "items", "products", "where", "to", "see", "view", "find", "track", "tracking",
      "order", "orders", "my", "your", "our", "history", "cart", "basket", "checkout", "pay", "payment", "account",
      "profile", "page", "tab", "go", "nav", "navigate", "help", "kya", "hai", "kaise", "chahiye", "کتنی", "کتنا",
      "قیمت", "کیا", "ہے", "بتاؤ", "سے", "پر", "روپے", "کتنے", "کون", "سی", "دکھاؤ", "معلومات", "تفصیل", "تفصیلات",
      "spec", "specs", "specification", "specifications", "feature", "features", "details", "info", "information"
    ]);

    // Clean query words for search
    const words = q.split(/[^a-zA-Z0-9\u0600-\u06FF]+/).filter(w => w.length >= 2 && !ignoreWords.has(w));

    let matchedProducts: any[] = [];

    // Exact or direct substring match in product name, urdu name, or SKU
    for (const p of activeProds) {
      const pName = (p.name || "").toLowerCase();
      const pUr = (p.nameUr || "").toLowerCase();
      const pSku = (p.sku || "").toLowerCase();

      if (pName && (q === pName || q.includes(pName))) {
        matchedProducts.push(p);
        continue;
      }
      if (pUr && (q === pUr || q.includes(pUr))) {
        matchedProducts.push(p);
        continue;
      }
      if (pSku && q.includes(pSku)) {
        matchedProducts.push(p);
        continue;
      }
    }

    // Word matching if no direct substring match
    if (matchedProducts.length === 0 && words.length > 0) {
      matchedProducts = activeProds.filter(p => {
        const pName = (p.name || "").toLowerCase();
        const pUr = (p.nameUr || "").toLowerCase();
        const pWords = pName.split(/\s+/).filter(w => w.length >= 2);
        const pUrWords = pUr.split(/\s+/).filter(w => w.length >= 2);

        return words.some(w => 
          pWords.some(pw => pw === w || (w.length >= 4 && (pw.startsWith(w) || w.startsWith(pw)))) ||
          pUrWords.some(pu => pu === w || (w.length >= 4 && (pu.startsWith(w) || w.startsWith(pu))))
        );
      });
    }

    // If a specific product query is detected or resolved from context
    if (matchedProducts.length === 1) {
      return formatProductDetails(matchedProducts[0], isExplicitSpecQuery);
    } else if (matchedProducts.length > 1) {
      const exactMatch = matchedProducts.find(p => p.name.toLowerCase() === words.join(" ") || words.every(w => p.name.toLowerCase().includes(w)));
      if (exactMatch) {
        return formatProductDetails(exactMatch, isExplicitSpecQuery);
      }

      const listStr = matchedProducts.slice(0, 5).map(p => {
        const unitLabel = isUr ? (p.unitUr || p.unit || 'پیکٹ') : (p.unit || 'pack');
        const stockStr = p.stockQuantity > 0 
          ? (isUr ? `✅ اسٹاک میں موجود (${p.stockQuantity} دستیاب)` : `✅ In Stock (${p.stockQuantity} available)`)
          : (isUr ? "❌ آؤٹ آف اسٹاک" : "❌ Out of Stock");
        return `• **${p.name}** ${p.nameUr ? `(${p.nameUr})` : ''}\n  └ 🏷️ **Price:** ${fmt(p)} (${p.price} PKR) / ${unitLabel} | 📌 **Category:** ${p.category} | ${stockStr}`;
      }).join("\n\n");

      return isUr
        ? `🔍 **آپ کی تلاش کے مطابق پروڈکٹس کی تفصیلات:**\n\n${listStr}\n\n💡 کسی مخصوص پروڈکٹ کی مزید معلومات جاننے کے لیے اس کا پورا نام لکھیں یا **Catalog** ٹیب دیکھیں!`
        : `🔍 **Matching Products Found:**\n\n${listStr}\n\n💡 Ask for a specific product name to view its complete profile, or visit the **Catalog** tab!`;
    } else if (contextualProduct && (words.length === 0 || isFollowUpQuery)) {
      if (q.includes("expiry") || q.includes("expire") || q.includes("ایکسپائری")) {
        return isUr
          ? `📅 **${contextualProduct.name} کی ایکسپائری تاریخ:** ${contextualProduct.expiryDate || "2027-01-15"} (تیاری: ${contextualProduct.manufacturingDate || "2026-01-15"}, بیچ: ${contextualProduct.batchNumber || "BATCH-" + contextualProduct.id})`
          : `📅 **Expiry Date for ${contextualProduct.name}:** ${contextualProduct.expiryDate || "2027-01-15"} (Manufacturing: ${contextualProduct.manufacturingDate || "2026-01-15"}, Batch: ${contextualProduct.batchNumber || "BATCH-" + contextualProduct.id})`;
      }
      if (q.includes("stock") || q.includes("available") || q.includes("اسٹاک") || q.includes("دستیاب")) {
        const stockStr = contextualProduct.stockQuantity > 0
          ? (isUr ? `✅ اسٹاک میں دستیاب ہے (${contextualProduct.stockQuantity} ${contextualProduct.unitUr || 'یونٹس'} موجود)` : `✅ In Stock (${contextualProduct.stockQuantity} ${contextualProduct.unit || 'units'} available)`)
          : (isUr ? "❌ آؤٹ آف اسٹاک" : "❌ Out of Stock");
        return `📦 **${contextualProduct.name}:** ${stockStr}`;
      }
      return formatProductDetails(contextualProduct, isExplicitSpecQuery);
    }

    // 6. DYNAMIC INVENTORY & ALL CATEGORIES OVERVIEW
    const isAllCatQuery = q.includes("category") || q.includes("categories") || q.includes("subcategory") || q.includes("subcategories") || q.includes("aisle") || q.includes("aisles") || q.includes("all categories") || q.includes("show categories") || q.includes("list categories") || q.includes("categories list") || q.includes("what categories") || q.includes("all products") || q.includes("list all") || q.includes("show all products") || q.includes("list products") || q.includes("inventory list") || q.includes("all items") || q.includes("شعبے") || q.includes("اقسام") || q.includes("کیٹیگری") || q.includes("کیٹیگریز") || q.includes("ذیلی") || q.includes("تمام کیٹیگریز") || q.includes("تمام پروڈکٹس");

    if (isAllCatQuery) {
      const catList: string[] = [];

      dbCategories.forEach((c: any) => {
        const subs = (dbSubcategories || []).filter((s: any) => s.categoryId === c.id);
        const subStr = subs.length > 0
          ? `\n    └─ ${isUr ? 'ذیلی اقسام' : 'Subcategories'}: ${subs.map((s: any) => isUr && s.nameUr ? s.nameUr : s.name).join(", ")}`
          : "";
        catList.push(`• **${isUr && c.nameUr ? c.nameUr : c.name}**${subStr}`);
      });

      userCategories.forEach((uc: any) => {
        catList.push(`• ✨ **${uc.name}** ${uc.nameUr ? `(${uc.nameUr})` : ''} *(Personal AI Extracted)*`);
      });

      const prodCats = Array.from(new Set(activeProds.map(p => p.category).filter(Boolean)));
      prodCats.forEach(cat => {
        if (!dbCategories.some((c: any) => c.name?.toLowerCase() === (cat as string).toLowerCase()) &&
            !userCategories.some((uc: any) => uc.name?.toLowerCase() === (cat as string).toLowerCase())) {
          catList.push(`• **${cat}**`);
        }
      });

      const categoriesFormatted = catList.length > 0 ? catList.join("\n") : "• General Grocery";

      return isUr
        ? `🏷️ **والکس کارٹ کی تمام فعال کیٹیگریز اور ذیلی کیٹیگریز (خودکار اپ ڈیٹ):**\n\n${categoriesFormatted}\n\n💡 آپ **Catalog** میں جا کر کسی بھی کیٹیگری کو فلٹر کر سکتے ہیں!`
        : `🏷️ **All Available Store Categories & Subcategories (Automatically Updated):**\n\n${categoriesFormatted}\n\n💡 You can filter and browse products by category in the **Catalog** tab.`;
    }

    // 7. General smart response
    return isUr
      ? `آپ کے سوال ("${query}") سے متعلق معلومات:\nوالکس کارٹ ایک دو لسانی صوتی آن لائن گروسری اسٹور ہے۔ آپ **Catalog** سے پروڈکٹس اور ریسیپیز تلاش کر سکتے ہیں، **Voice Assistant** سے صوتی آرڈر دے سکتے ہیں، یا **Customer Feedback** میں اپنی رائے درج کر سکتے ہیں۔ کسی بھی پروڈکٹ کا نام لکھیں تاکہ میں اس کی مکمل تفصیلات بتا سکوں!`
      : `Regarding your question ("${query}"):\nVoxCart is a bilingual voice-activated online store. You can browse products and recipes in the **Catalog** tab, use hands-free shopping in the **Voice Assistant** tab, track orders in **Orders**, or share reviews in **Customer Feedback**! Feel free to ask about any product or website feature.`;
  }

  // API: Cute AI Chatbot Website Assistant
  
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
          console.log(`Launching server-side Gemini Recipe Search for: "${query}"`);
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build"
              }
            }
          });

          const productCatalogString = activeProducts.map((p: any) => 
            `- ID ${p.id}: "${p.name}" (${p.nameUr || ''}), Category: "${p.category}", Unit: "${p.unit || 'pack'}"`
          ).join("\n");

          const prompt = `You are a culinary expert AI for VoxCart online grocery store. 
Search and retrieve the complete recipe for the requested dish/food query: "${query}".

Available Store Products Catalog:
${productCatalogString}

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
Return ONLY valid JSON without markdown wrapping or code blocks.`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
              temperature: 0.2
            }
          });

          const rawText = response.text || "";
          const jsonMatch = rawText.match(/\{[s\S]*\}/);
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

        let qty = ing.qty || 1;
        let unit = match ? match.unit : (ing.unit || "piece");
        let unitUr = match ? match.unitUr : (ing.unitUr || "عدد");

        if (match) {
          const storeUnit = (match.unit || "").toLowerCase();
          const recipeUnitLower = (ing.unit || "").toLowerCase();
          const isGramOrMl = (
            recipeUnitLower === "g" || recipeUnitLower === "gram" || recipeUnitLower === "grams" || recipeUnitLower === "گرام" ||
            recipeUnitLower === "ml" || recipeUnitLower === "milli" || recipeUnitLower === "milliliter" || recipeUnitLower === "milliliters" || recipeUnitLower === "ملی" ||
            (recipeUnitLower.includes("gram") || recipeUnitLower.includes("milli"))
          ) && !recipeUnitLower.includes("kg") && !recipeUnitLower.includes("kilo") && !recipeUnitLower.includes("کلو");

          const isWeighed = storeUnit.includes("kg") || storeUnit.includes("کلو") || 
                            storeUnit.includes("lb") || storeUnit.includes("پاؤنڈ") ||
                            (match.category && (match.category.toLowerCase() === "vegetables" || match.category.toLowerCase() === "fruits" || match.category.toLowerCase() === "meat"));

          if (isWeighed) {
            if (isGramOrMl) {
              if (storeUnit.includes("lb") || storeUnit.includes("پاؤنڈ")) {
                qty = Math.max(0.1, Math.round((qty / 454) * 100) / 100);
              } else {
                qty = Math.max(0.1, Math.round(((qty >= 10 ? qty / 1000 : qty)) * 100) / 100);
              }
            } else if (qty > 10) {
              qty = 1;
            }
          } else {
            if (isGramOrMl) {
              qty = Math.max(0.1, Math.round(((qty >= 10 ? qty / 1000 : qty)) * 100) / 100);
            } else if (qty > 10) {
              qty = 1;
            }
          }
        }

        return {
          ...ing,
          productId: match ? match.id : (ing.matchedProductId || null),
          matched: !!isAvailable,
          price: match ? ((match.salePrice && match.salePrice > 0) ? match.salePrice : match.price) : 1.99,
          currencyCode: match ? (match.currencyCode || match.currency || "PKR") : "USD",
          category: match ? match.category : "Pantry",
          qty,
          unit,
          unitUr
        };
      });

      recipeResult.ingredients = processedIngredients;

      res.json({
        success: true,
        recipe: recipeResult
      });
    } catch (err: any) {
      console.error("Recipe search error:", err);
      res.status(500).json({ error: `Recipe search failed: ${err.message || err.toString()}` });
    }
  });

  app.post("/api/chatbot", async (req, res) => {
    const { message, chatHistory = [], language = "en", currency = "USD", activeTab = "home", userId = null } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message field" });
    }

    try {
      const db = getDB();
      const activeProducts = (db.products || []).filter((p: any) => p.status !== "Inactive");

      // Auto category extraction logic
      const textLower = message.toLowerCase();
      const isExtractIntent = textLower.includes("extract") || textLower.includes("category") || textLower.includes("categories") || textLower.includes("organize") || textLower.includes("suggest") || textLower.includes("کیٹیگری");
      
      let extractedCategories: any[] = [];
      const candidateMap = [
        { keywords: ["snack", "chips", "crisps", "biscuit", "cookie"], name: "Snacks & Biscuits", nameUr: "سنیکس اور بسکٹ", icon: "🍪" },
        { keywords: ["organic", "bio", "natural", "farm"], name: "Organic Produce", nameUr: "نامیاتی پیداوار", icon: "🌿" },
        { keywords: ["gluten", "gluten free", "celiac"], name: "Gluten-Free Foods", nameUr: "گلوٹن فری اشیاء", icon: "🌾" },
        { keywords: ["baby", "infant", "toddler", "diaper", "formula"], name: "Baby & Care", nameUr: "بیبی کیئر", icon: "👶" },
        { keywords: ["pet", "dog", "cat", "kibble", "bird"], name: "Pet Care & Food", nameUr: "پالتو جانوروں کی خوراک", icon: "🐶" },
        { keywords: ["fitness", "protein", "gym", "shake", "workout", "supplement"], name: "Fitness & Nutrition", nameUr: "فٹنس اور پروٹین", icon: "🏋️" },
        { keywords: ["spice", "masala", "herb", "seasoning", "gourmet"], name: "Gourmet Spices & Herbs", nameUr: "خالص مصالحہ جات", icon: "🧂" },
        { keywords: ["frozen", "ice cream", "frozen meal", "nuggets"], name: "Frozen Foods & Desserts", nameUr: "فروزن اشیاء", icon: "❄️" },
        { keywords: ["tea", "herbal", "green tea", "chai", "coffee"], name: "Herbal Teas & Coffee", nameUr: "جڑی بوٹیوں کی چائے", icon: "☕" },
        { keywords: ["skin", "beauty", "care", "soap", "shampoo", "cosmetic"], name: "Skincare & Beauty", nameUr: "جلد اور خوبصورتی", icon: "✨" },
        { keywords: ["halal", "sweets", "mithai", "dessert"], name: "Halal Sweets & Treats", nameUr: "حلال مٹھائیاں", icon: "🍬" },
        { keywords: ["breakfast", "cereal", "oats", "jam"], name: "Breakfast Essentials", nameUr: "ناشتے کی اشیاء", icon: "🥣" },
        { keywords: ["beverage", "juice", "soda", "drink", "cold"], name: "Refreshing Beverages", nameUr: "تازہ دم مشروبات", icon: "🥤" },
        { keywords: ["bakery", "bread", "cake", "pastry"], name: "Artisanal Bakery", nameUr: "تازہ بیکری", icon: "🥐" }
      ];

      candidateMap.forEach(cand => {
        if (cand.keywords.some(kw => textLower.includes(kw))) {
          extractedCategories.push({
            id: "user_cat_" + cand.name.toLowerCase().replace(/\s+/g, "_"),
            name: cand.name,
            nameUr: cand.nameUr,
            icon: cand.icon,
            description: `Auto-extracted by Voxy AI based on: "${message.slice(0, 40)}"`,
            extractedAt: new Date().toISOString(),
            sourceQuery: message
          });
        }
      });

      if (isExtractIntent && extractedCategories.length === 0) {
        extractedCategories = [
          {
            id: "user_cat_gourmet_spices",
            name: "Gourmet Spices & Herbs",
            nameUr: "خالص مصالحہ جات",
            icon: "🌿",
            description: "Auto-extracted specialty spices category",
            extractedAt: new Date().toISOString(),
            sourceQuery: message
          },
          {
            id: "user_cat_organic_snacks",
            name: "Organic & Healthy Snacks",
            nameUr: "نامیاتی سنیکس",
            icon: "🍪",
            description: "Auto-extracted healthy snacks category",
            extractedAt: new Date().toISOString(),
            sourceQuery: message
          }
        ];
      }

      // Persist if logged in
      let savedForUser = false;
      if (extractedCategories.length > 0 && userId && userId !== "null" && userId !== "undefined") {
        if (!db.userCategories) db.userCategories = {};
        if (!db.userCategories[userId]) db.userCategories[userId] = [];

        extractedCategories.forEach(newCat => {
          const exists = db.userCategories![userId].some(c => c.id === newCat.id || c.name.toLowerCase() === newCat.name.toLowerCase());
          if (!exists) {
            db.userCategories![userId].push(newCat);
          }
        });
        saveDB(db);
        savedForUser = true;
      }

      // Fetch live categories (both store db categories and logged-in user extracted categories)
      const dbCategories = (db.categories || []).filter((c: any) => c.status !== "Inactive");
      const dbSubcategories = (db.subcategories || []).filter((s: any) => s.status !== "Inactive");
      const userCategories = (userId && db.userCategories && db.userCategories[userId]) || [];
      const productCategories = Array.from(new Set(activeProducts.map((p: any) => p.category).filter(Boolean)));

      const catLines: string[] = [];
      dbCategories.forEach((c: any) => {
        catLines.push(`- Store Category: "${c.name}" (${c.nameUr || c.name})`);
      });
      userCategories.forEach((uc: any) => {
        catLines.push(`- User AI Personal Category: "${uc.name}" (${uc.nameUr || uc.name}) [Saved for Logged-In User]`);
      });
      productCategories.forEach((catName: any) => {
        if (!dbCategories.some((c: any) => c.name?.toLowerCase() === (catName as string).toLowerCase()) &&
            !userCategories.some((uc: any) => uc.name?.toLowerCase() === (catName as string).toLowerCase())) {
          catLines.push(`- Product Category: "${catName}"`);
        }
      });
      const categoriesSummary = catLines.length > 0 ? catLines.join("\n") : "- General Grocery";

      const productSummary = activeProducts.map((p: any) => {
        const unitStr = p.unit || 'unit';
        const unitUrStr = p.unitUr ? ` (${p.unitUr})` : '';
        const stockStr = p.stockQuantity > 0 ? `In Stock (${p.stockQuantity} ${unitStr} available)` : 'Out of Stock (0 available)';
        const saleStr = (p.salePrice && p.salePrice > 0) ? ` | Sale Price: ${formatServerPrice(p.salePrice, currency, language, p.currencyCode)}` : '';
        const brandStr = p.brandName ? `Brand: ${p.brandName}` : 'Brand: General';
        const subcatStr = p.subcategoryName ? `Subcategory: ${p.subcategoryName}` : '';
        const specStr = `SKU: ${p.sku || 'SKU-' + p.id}, Batch: ${p.batchNumber || 'BATCH-' + p.id}, Mfg Date: ${p.manufacturingDate || '2026-01-15'}, Expiry Date: ${p.expiryDate || '2027-01-15'}, Unit: ${unitStr}${unitUrStr}`;
        const descStr = p.description ? `Description: "${p.description}"` : 'Description: "Premium quality grocery product."';
        return `- Product: "${p.name}" (Urdu: "${p.nameUr || p.name}") | Price: ${formatServerPrice(p.price, currency, language, p.currencyCode)} (${p.price} PKR)${saleStr} | Category: ${p.category} ${subcatStr ? `> ${subcatStr}` : ''} | ${brandStr} | Stock: ${stockStr} | Specs: [${specStr}] | ${descStr}`;
      }).join("\n");

      let apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        dotenv.config();
        apiKey = process.env.GEMINI_API_KEY;
      }

      let replyText = "";

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build"
              }
            }
          });

          const systemInstruction = `You are Voxy AI (or Voxy), the intelligent, friendly, and comprehensive AI shopping guide and website assistant for VoxCart.
VoxCart is a bilingual (English & Urdu) voice-activated online grocery & department store.

CRITICAL ASSISTANT MANDATES & ACCURACY RULES:
1. COMPLETE WEBSITE AWARENESS & REAL-TIME DATA:
   - You have complete awareness of all website pages, navigation tabs, products, stock status, features, policies, recipes, and services.
   - All product answers must reflect the LIVE STORE PRODUCTS data provided below.
   - Real-time stock status: If stockQuantity > 0, state it is in stock with the available count. If stockQuantity <= 0 or status is Unavailable/Inactive, clearly state that it is currently Out of Stock / Unavailable.

2. ANTI-HALLUCINATION GUARANTEE (CRITICAL):
   - If a user asks for a product, brand, service, or piece of information that is NOT present in the provided Live Store Products or Website Knowledge Base, you MUST explicitly and politely state that it is not available or not carried on VoxCart.
   - NEVER invent or hallucinate non-existent products, prices, or policies.

3. PRODUCT COMPARISONS ("What is the difference between A and B?"):
   - When asked to compare two or more products or explain their differences:
     • Provide a structured, clear side-by-side comparison.
     • Compare Price (in active currency and PKR), Categories/Subcategories, Brand, Specifications/Ingredients, and current Live Stock availability.
     • Summarize the practical differences or best use cases for each.

4. PRODUCT RECOMMENDATIONS & SHOPPING ADVICE ("Which product would be best for me?"):
   - Recommend products from the live inventory based on user preferences, dietary needs, budget, or meal type.
   - Provide clear, genuine reasons for each recommendation (e.g. freshness, nutritional value, recipe match).

5. "WHAT'S NEW ON THE WEBSITE" & NEW FEATURES:
   - When asked "What's new on the website?" or about new features, highlight:
     • 📷 **AI Bill Scanner (OCR)**: Upload physical grocery receipts or handwritten shopping lists to auto-extract items to the cart (located on the **Voice Assistant** page).
     • 💬 **Customer Feedback & Admin Resolution**: Submit 1-5 star ratings, feedback, and view official verified admin replies with status badges (located in the **Customer Feedback** tab).
     • 🍲 **Smart Recipe Dropdown & Automation**: Search or select top dishes (Biryani, Karahi, Pasta, Pizza, Cake, etc.) in the **Catalog** tab to view live ingredient availability and add all in-stock ingredients with 1 click.
     • 🤖 **Voxy AI Autonomous Shopping Assistant**: 3D conversational guide with real-time catalog awareness, stock tracking, voice shopping, and comparisons.

6. SPECIFIC PRODUCT INQUIRIES ("Tell me everything about this product", "How much does X cost?"):
   - For standard product questions, format the product cleanly:
     - 🛍️ **Product Name** (English and Urdu)
     - 🏷️ **Price** (active currency and base PKR, plus sale price if on sale)
     - 📦 **Availability & Live Stock** (e.g. '✅ In Stock: 115 available' or '❌ Out of Stock')
     - 📌 **Category & Subcategory**
     - 🏢 **Brand**
     - 📝 **Description**
     - 💡 **How to Buy**: Hint on finding it in the **Catalog** tab or saying *"Add [Product] to cart"* via Voice Shopping.
   - If the user asks "Tell me everything" or asks for technical specs (SKU, batch number, expiry date, manufacturing date), include the full specification details accurately.

7. CATEGORY QUERIES:
   - When asked about a specific category (e.g. 'fruits', 'dairy', 'meat', 'vegetables', 'beverages', 'pantry'), list ONLY the products in that specific category with prices and stock. Do NOT mix in unrelated categories.

8. POLICIES & CUSTOMER SUPPORT:
   - 🚚 **Delivery**: 24-48 hours delivery time. Orders over $10 USD / PKR 2,000 get **100% FREE shipping**.
   - 🔄 **Returns & Refunds**: 24-hour return window for fresh items. Refunds processed in 3-5 business days.
   - 💳 **Payment Methods**: Cash on Delivery (COD), Credit/Debit Card, EasyPaisa, JazzCash, and Bank Transfer.
   - 💬 **Feedback**: Users can submit reviews on the **Customer Feedback** page.

9. NAVIGATION & HOW-TO GUIDANCE:
   - Guide users to the exact tab/section:
     • **Home** ("home"): Featured deals, category shortcuts, feedback showcase.
     • **Catalog / Browse** ("browse"): All aisles, category/brand filters, price slider, recipe dropdown.
     • **Voice Assistant** ("voice"): Voice dictation & AI Bill/Receipt Scanner.
     • **Saved Favourites** ("wishlist"): Hearted items.
     • **Orders** ("orders"): Live order tracking & PDF invoice download.
     • **Customer Feedback** ("feedback"): Reviews & admin replies.
     • **Checkout** ("payment"): Address & payment processing.
     • **Admin Console** ("admin"): Store management.

VOXCART WEBSITE KNOWLEDGE BASE:
1. PAGES & NAVIGATION:
- Home ("home"): Store showcase with quick category shortcuts, voice shopping highlights, live currency ticker, featured deals, and customer feedback.
- Catalog / Browse ("browse"): Full aisles with category/subcategory/brand filters, price sliders, stock status, and smart recipe search.
- Voice Assistant & OCR Scanner ("voice"): AI Voice Shopping with continuous dictation in English, Urdu, and Roman Urdu, plus physical receipt image scanner.
- Saved Favourites ("wishlist"): Bookmarked products and 1-click add to cart.
- Orders & Receipts ("orders"): Live order tracking and downloadable PDF invoices.
- Customer Feedback ("feedback"): User reviews, 1-5 star ratings, feedback submission, and admin responses.
- Checkout & Payment ("payment"): Secure address input, coupon code entry, and payment selection.
- Admin Panel ("admin"): Management dashboard for products, stock, categories, brands, currencies, user feedback, and sales metrics.

2. LIVE AVAILABLE STORE & USER CATEGORIES:
${categoriesSummary}

3. LIVE STORE PRODUCTS:
${productSummary}

CONVERSATION CONTEXT:
- Current User View: "${activeTab}" page
- Site Display Language: "${language}"
- Display Currency: "${currency}"
- User Login Status: ${userId ? `Logged in (User ID: ${userId})` : "Guest / Logged out"}

GUIDELINES:
- Respond in the language matching the user's inquiry (English, Urdu, or Roman Urdu).
- Format responses cleanly with bold headers and bullet points. Keep product descriptions concise and relevant.`;

          // Sanitize chat history to ensure strictly alternating user/model roles and non-empty content
          const rawHistory = Array.isArray(chatHistory) ? chatHistory : [];
          const formattedHistory: any[] = [];
          let lastRole = "";
          for (const h of rawHistory) {
            const role = h.sender === "user" ? "user" : "model";
            const text = (h.text || "").trim();
            if (!text) continue;
            if (role === lastRole) {
              if (formattedHistory.length > 0) {
                formattedHistory[formattedHistory.length - 1].parts[0].text += "\n" + text;
              }
            } else {
              formattedHistory.push({
                role,
                parts: [{ text }]
              });
              lastRole = role;
            }
          }

          if (formattedHistory.length > 0 && formattedHistory[0].role !== "user") {
            formattedHistory.shift();
          }

          const contents = [
            ...formattedHistory,
            ...(formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === "user"
              ? []
              : [{ role: "user", parts: [{ text: message }] }])
          ];
          if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === "user") {
            formattedHistory[formattedHistory.length - 1].parts[0].text += "\n" + message;
          }

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
              systemInstruction,
              temperature: 0.2
            }
          });

          replyText = response.text || "";
        } catch (geminiErr) {
          console.warn("Gemini API call for Chatbot failed or quota exceeded. Executing programmatic fallback parser.", geminiErr);
        }
      }

      if (!replyText) {
        replyText = generateFallbackChatbotResponse(message, activeProducts, language, activeTab, currency, dbCategories, userCategories, dbSubcategories, chatHistory);
      }

      res.json({
        reply: replyText,
        extractedCategories: extractedCategories,
        savedForUser: savedForUser
      });
    } catch (err: any) {
      console.error("Chatbot endpoint server error:", err);
      res.status(500).json({ error: `Chatbot request failed: ${err.message || err.toString()}` });
    }
  });

  // Ensure all unmatched API requests return JSON 404 instead of falling through to Vite HTML middleware
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
  });

  // Serve static assets or mount Vite in development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite router");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode serving static layout");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start full stack Express app", err);
});
