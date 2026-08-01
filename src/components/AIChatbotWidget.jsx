import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  Bot, X, Send, Trash2, Sparkles, MessageSquare, ChevronRight, ChevronLeft,
  HelpCircle, ShoppingBag, Mic, Truck, CreditCard, ShieldCheck, 
  UserCheck, ExternalLink, Minimize2, RefreshCw, Zap, BookOpen, Tag, Search
} from "lucide-react";
import { api } from "../utils/api";
import { formatPrice } from "../utils/localizer";
import { parseVoiceCommand } from "../utils/voiceParser";

function generateDynamicClientResponse(query, lang, products = [], currency = "USD", cartItems = [], orders = [], favourites = []) {
  const q = (query || "").toLowerCase().trim();
  const isUr = lang === "ur" || /[\u0600-\u06FF]/.test(query) || q.includes("kya") || q.includes("hai") || q.includes("kaise") || q.includes("chahiye");

  const fmt = (price, fromCurr) => formatPrice(price, currency, lang, fromCurr);

  // 1. Out of scope check
  const outOfScopeKeywords = [
    "capital of", "weather in", "who is the president", "who won", "write code", "python",
    "java script", "math equation", "solve", "prime minister", "movie", "song", "joke", "quantum",
    "tell me about earth", "solar system", "history of", "president of"
  ];
  if (outOfScopeKeywords.some(k => q.includes(k)) && !q.includes("voxcart") && !q.includes("store") && !q.includes("product") && !q.includes("item")) {
    return isUr
      ? "میں والکس کارٹ کا **VoxBot AI** اسسٹنٹ ہوں۔ 🤖 میں صرف اس ویب سائٹ کے پروڈکٹس، صوتی آرڈر، پالیسیوں اور نیویگیشن سے متعلق سوالات کا جواب دیتا ہوں۔ آپ VoxCart سے متعلق کیا جاننا چاہتے ہیں؟"
      : "I am VoxBot, your VoxCart AI Shopping Assistant! 🤖 I only answer questions related to VoxCart products, shopping features, voice ordering, policies, accounts, and website navigation. How can I help you with your VoxCart shopping today?";
  }

  // 2. DYNAMIC INVENTORY & CATEGORY OVERVIEW
  const isAllCatQuery = q.includes("all categories") || q.includes("show categories") || q.includes("list categories") || q.includes("categories list") || q.includes("what categories") || q.includes("all products") || q.includes("list all") || q.includes("show all products") || q.includes("list products") || q.includes("inventory list") || q.includes("all items") || q.includes("شعبے") || q.includes("اقسام") || q.includes("تمام کیٹیگریز") || q.includes("تمام پروڈکٹس");

  if (isAllCatQuery && Array.isArray(products) && products.length > 0) {
    const activeProds = products.filter(p => p.status !== "Inactive");
    const categoriesSet = Array.from(new Set(activeProds.map(p => p.category).filter(Boolean)));

    let categoryBreakdown = "";
    categoriesSet.forEach(cat => {
      const catItems = activeProds.filter(p => p.category === cat);
      if (catItems.length > 0) {
        const itemLines = catItems.map(p => 
          `  • **${p.name}** ${p.nameUr ? `(${p.nameUr})` : ''}: **${fmt(p.price, p.currencyCode)}** per ${isUr ? (p.unitUr || 'پیکٹ') : (p.unit || 'pack')} ${p.stockQuantity <= 0 ? (isUr ? '(آؤٹ آف اسٹاک)' : '(Out of Stock)') : ''}`
        ).join("\n");
        categoryBreakdown += `\n📌 **${cat}** (${catItems.length} ${isUr ? 'اشیائے خوردونوش' : 'items'}):\n${itemLines}\n`;
      }
    });

    return isUr
      ? `🏷️ **والکس کارٹ کی تمام کیٹیگریز اور موجودہ پروڈکٹس (مکمل فہرست):**\n${categoryBreakdown}\n💡 **کل پروڈکٹس:** ${activeProds.length} | آپ **Catalog** ٹیب سے کسی بھی وقت خرید سکتے ہیں!`
      : `🏷️ **VoxCart Store Inventory & Categories (Complete List):**\n${categoryBreakdown}\n💡 **Total Available Items:** ${activeProds.length} across ${categoriesSet.length} categories. Visit the **Catalog** tab to filter and add items to your cart!`;
  }

  // 2b. Requesting SPECIFIC Category products dynamically
  if (Array.isArray(products) && products.length > 0) {
    const activeProds = products.filter(p => p.status !== "Inactive");
    
    let targetCategory = null;
    if (q.includes("dairy") || q.includes("milk") || q.includes("cheese") || q.includes("egg") || q.includes("butter") || q.includes("دودھ") || q.includes("انڈے") || q.includes("پنیر") || q.includes("مکھن")) {
      targetCategory = "Dairy";
    } else if (q.includes("fruit") || q.includes("apple") || q.includes("banana") || q.includes("mango") || q.includes("orange") || q.includes("پھل") || q.includes("سیب") || q.includes("کیلے") || q.includes("آم") || q.includes("مالٹے")) {
      targetCategory = "Fruits";
    } else if (q.includes("veg") || q.includes("potato") || q.includes("tomato") || q.includes("onion") || q.includes("carrot") || q.includes("سبزی") || q.includes("آلو") || q.includes("ٹماٹر") || q.includes("پیاز") || q.includes("گاجر")) {
      targetCategory = "Vegetables";
    } else if (q.includes("meat") || q.includes("chicken") || q.includes("beef") || q.includes("fish") || q.includes("seafood") || q.includes("گوشت") || q.includes("مرغی") || q.includes("قیمہ") || q.includes("مچھلی")) {
      targetCategory = "Meat";
    } else if (q.includes("beverage") || q.includes("drink") || q.includes("coke") || q.includes("coca") || q.includes("water") || q.includes("tea") || q.includes("coffee") || q.includes("مشروبات") || q.includes("چائے") || q.includes("پانی") || q.includes("کولڈ ڈرنک")) {
      targetCategory = "Beverages";
    } else if (q.includes("pantry") || q.includes("staple") || q.includes("rice") || q.includes("oil") || q.includes("sugar") || q.includes("salt") || q.includes("spice") || q.includes("پنساری") || q.includes("چاول") || q.includes("آئل") || q.includes("مصالحے") || q.includes("چینی") || q.includes("نمک")) {
      targetCategory = "Pantry";
    } else {
      const matchedCat = activeProds.find(p => p.category && q.includes(p.category.toLowerCase()));
      if (matchedCat) {
        targetCategory = matchedCat.category;
      }
    }

    const isCategoryOverviewQuery = targetCategory && (
      q.includes("what") || q.includes("show") || q.includes("list") || q.includes("available") || q.includes("category") || q.includes("all") || q.includes("have") ||
      q.includes("کون") || q.includes("کیا") || q.includes("دیکھو") || q.includes("فہرست") || q.includes("ہیں")
    );

    if (targetCategory && isCategoryOverviewQuery) {
      const catItems = activeProds.filter(p => (p.category || "").toLowerCase().includes(targetCategory.toLowerCase()));
      if (catItems.length > 0) {
        const catList = catItems.map(p =>
          `• **${p.name}** ${p.nameUr ? `(${p.nameUr})` : ''}: **${fmt(p.price, p.currencyCode)}** / ${isUr ? (p.unitUr || 'پیکٹ') : (p.unit || 'pack')} — ${p.stockQuantity > 0 ? (isUr ? `دستیاب (${p.stockQuantity})` : `In Stock (${p.stockQuantity})`) : (isUr ? 'آؤٹ آف اسٹاک' : 'Out of Stock')}`
        ).join("\n");

        return isUr
          ? `🏷️ **${targetCategory} کیٹیگری کی تمام دستیاب اشیاء:**\n\n${catList}\n\n💡 آپ **Catalog** ٹیب میں '${targetCategory}' فلٹر منتخب کر کے یہ تمام اشیاء کارٹ میں شامل کر سکتے ہیں!`
          : `🏷️ **${targetCategory} Category — All Available Products:**\n\n${catList}\n\n💡 Visit the **Catalog** tab and select the **${targetCategory}** filter to purchase any of these items!`;
      }
    }
  }

  // 3. WEBSITE FEATURE & INSTRUCTION CHECKS
  if (q.includes("favourite") || q.includes("favorite") || q.includes("bookmark") || q.includes("heart") || q.includes("save") || q.includes("پسندیدہ") || q.includes("فیورٹ")) {
    return isUr
      ? "❤️ **پسندیدہ اشیاء محفوظ کرنے کا طریقہ (Add to Favorites):**\n1. کسی بھی پروڈکٹ کارڈ کے اوپر دائیں کونے میں موجود **دل (❤️)** کے آئیکن پر کلک کریں۔\n2. وہ پروڈکٹ آپ کی پسندیدہ لسٹ میں محفوظ ہو جائے گی۔\n3. اوپر نیویگیشن بار میں **Saved Favourites** ٹیب کھول کر آپ تمام محفوظ شدہ اشیاء دیکھ سکتے ہیں اور ایک کلک میں کارٹ میں ڈال سکتے ہیں!"
      : "❤️ **How to Add Items to Favorites & Bookmarks:**\n1. Click the **Heart Icon (❤️)** on the top right of any product card in the Catalog or Home page.\n2. The item will be instantly saved to your personal wishlist.\n3. Navigate to the **Saved Favourites** tab in the main menu anytime to view all your bookmarked groceries and add them to your cart in 1-click!";
  }

  if (q.includes("biryani")) {
    return isUr
      ? "🥘 **چکن بریانی کی مکمل ریسپی اور درکار اجزاء:**\n- 🍗 **چکن (Chicken Breast):** 1 کلو\n- 🌾 **سیلا / باسمتی چاول (White Rice):** 1 کلو\n- 🧅 **پیاز (Onions):** 250 گرام\n- 🍅 **ٹماٹر (Tomatoes):** 250 گرام\n- 🥔 **آلو (Potatoes):** 250 گرام\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 250 ملی لیٹر\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🌶️ **بریانی مصالحہ اور ادرک لہسن پیسٹ:** درکار مصالحہ جات\n- 🥛 **دہی اور تازہ پودینہ:** 250 گرام دہی اور پودینہ\n\n💡 **طریقہ:** **Catalog** ٹیب میں جائیں اور سرچ میں 'Biryani' لکھیں تاکہ یہ تمام اجزاء ایک کلک میں کارٹ میں شامل کر سکیں!"
      : "🥘 **Chicken Biryani Recipe & Complete Ingredients:**\n- 🍗 **Chicken Breast:** 1 KG\n- 🌾 **White Rice:** 1 KG\n- 🧅 **Onions:** 250 Grams\n- 🍅 **Tomatoes:** 250 Grams\n- 🥔 **Potatoes:** 250 Grams\n- 🛢️ **Cooking Oil:** 250 ML\n- 🧂 **Salt:** 1 Pack\n- 🌶️ **Biryani Masala & Ginger Garlic Paste:** Essential Spices\n- 🥛 **Yogurt & Fresh Mint:** 250g Yogurt & Fresh Mint\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Biryani' to add all these required ingredients to your cart in 1-click!";
  }

  if (q.includes("karahi")) {
    return isUr
      ? "🍲 **چکن کڑاہی کی مکمل ریسپی اور درکار اجزاء:**\n- 🍗 **چکن (Chicken Breast):** 1 کلو\n- 🍅 **ٹماٹر (Tomatoes):** 1 کلو\n- 🧅 **پیاز (Onions):** 1 کلو\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 1 لیٹر\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🌶️ **کڑاہی مصالحہ، ہری مرچ اور ادرک لہسن پیسٹ**\n- 🥛 **دہی (Yogurt)**\n\n💡 **طریقہ:** **Catalog** ٹیب میں جائیں اور 'Karahi' سرچ کر کے 1 کلک میں تمام اجزاء کارٹ میں شامل کریں!"
      : "🍲 **Chicken Karahi Recipe & Complete Ingredients:**\n- 🍗 **Chicken Breast:** 1 KG\n- 🍅 **Tomatoes:** 1 KG\n- 🧅 **Onions:** 1 KG\n- 🛢️ **Cooking Oil:** 1 Liter\n- 🧂 **Salt:** 1 Pack\n- 🌶️ **Karahi Masala, Green Chillies & Ginger Garlic Paste**\n- 🥛 **Yogurt**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Karahi' to add all required ingredients to your cart in 1-click!";
  }

  if (q.includes("nihari")) {
    return isUr
      ? "🍲 **نہاری کی مکمل ریسپی اور درکار اجزاء:**\n- 🥩 **گوشت / بیف (Ground Beef / Beef):** 1 کلو\n- 🌾 **گندم کا آٹا (Flour):** 1 کلو\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 1 لیٹر\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🌶️ **نہاری مصالحہ، ہری مرچ، ادرک اور لیموں**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Nihari' سرچ کریں اور 1 کلک میں تمام اجزاء کارٹ میں ڈالیں!"
      : "🍲 **Special Nihari Recipe & Complete Ingredients:**\n- 🥩 **Beef / Meat:** 1 KG\n- 🌾 **Wheat Flour (Atta):** 1 KG\n- 🛢️ **Cooking Oil:** 1 Liter\n- 🧂 **Salt:** 1 Pack\n- 🌶️ **Nihari Special Masala, Ginger, Green Chillies & Lemon**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Nihari' to add all required ingredients to your cart in 1-click!";
  }

  if (q.includes("pasta")) {
    return isUr
      ? "🍝 **پاستا کی مکمل ریسپی اور درکار اجزاء:**\n- 🍝 **پاستا پیکٹ (Pasta):** 1 ڈبہ\n- 🍗 **چکن (Chicken Breast):** 1 کلو\n- 🥛 **خالص دودھ (Whole Milk):** 1 پیکٹ\n- 🧈 **مکھن (Butter):** 1 بلاک\n- 🧀 **چیدر / موزریلا پنیر (Cheese):** 1 پیکٹ\n- 🧄 **لہسن اور کالی مرچ**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Pasta' سرچ کر کے تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
      : "🍝 **Creamy Chicken Pasta Recipe & Complete Ingredients:**\n- 🍝 **Pasta Pack:** 1 Box\n- 🍗 **Chicken Breast:** 1 KG\n- 🥛 **Whole Milk:** 1 Pack\n- 🧈 **Butter:** 1 Block\n- 🧀 **Cheddar Cheese:** 1 Pack\n- 🧄 **Garlic & Black Pepper Spices**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Pasta' to add all required ingredients to your cart in 1-click!";
  }

  if (q.includes("pizza") || q.includes("پیزا")) {
    return isUr
      ? "🍕 **پیزا کی مکمل ریسپی اور درکار اجزاء:**\n- 🍕 **پیزا ڈو / کرسٹ:** 1 عدد\n- 🧀 **موزریلا و چیدر چیز (Cheese):** 1 پیکٹ\n- 🍅 **ٹماٹر / پیزا سوس (Tomatoes):** 1 کلو\n- 🍗 **چکن (Chicken Breast):** 1 کلو\n- 🫑 **شملہ مرچ اور زیتون (Capsicum & Olives)**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Pizza' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
      : "🍕 **Delicious Pizza Recipe & Complete Ingredients:**\n- 🍕 **Pizza Crust / Dough:** 1 Base\n- 🧀 **Mozzarella & Cheddar Cheese:** 1 Pack\n- 🍅 **Tomatoes / Pizza Sauce:** 1 KG\n- 🍗 **Chicken Breast:** 1 KG\n- 𫑁 **Bell Peppers & Olives**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Pizza' to add all required ingredients to your cart in 1-click!";
  }

  if (q.includes("cake") || q.includes("کیک")) {
    return isUr
      ? "🎂 **چاکلیٹ کیک کی مکمل ریسپی اور درکار اجزاء:**\n- 🥚 **انڈے (Eggs):** 1 درجن\n- 🥛 **خالص دودھ (Whole Milk):** 1 پیکٹ\n- 🧈 **مکھن (Butter):** 1 بلاک\n- 🍬 **چینی (Sugar):** 1 پیکٹ\n- 🌾 **گندم کا آٹا (Flour):** 1 کلو\n- 🍫 **کوکو پاؤڈر اور چاکلیٹ چپس**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Cake' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
      : "🎂 **Chocolate Cake Recipe & Complete Ingredients:**\n- 🥚 **Eggs:** 1 Dozen\n- 🥛 **Whole Milk:** 1 Pack\n- 🧈 **Butter:** 1 Block\n- 🍬 **Sugar:** 1 Pack\n- 🌾 **Wheat Flour (Atta):** 1 KG\n- 🍫 **Cocoa Powder & Chocolate Chips:** For flavor\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Cake' to add all required ingredients to your cart in 1-click!";
  }

  if (q.includes("burger") || q.includes("برگر")) {
    return isUr
      ? "🍔 **چکن برگر کی مکمل ریسپی اور درکار اجزاء:**\n- 🍔 **برگر بنز (Burger Buns):** 1 پیکٹ\n- 🍗 **چکن بریسٹ (Chicken Breast):** 1 کلو\n- 🧀 **چیدر چیز (Cheddar Cheese):** 1 پیکٹ\n- 🍅 **ٹماٹر (Tomatoes):** 1 کلو\n- 🧅 **پیاز (Onions):** 500 گرام\n- 🧈 **مکھن (Butter):** 1 بلاک\n- 🧴 **مایونیز اور کیچپ**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Burger' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
      : "🍔 **Chicken Burger Recipe & Complete Ingredients:**\n- 🍔 **Burger Buns:** 1 Pack\n- 🍗 **Chicken Breast:** 1 KG\n- 🧀 **Cheddar Cheese:** 1 Pack\n- 🍅 **Tomatoes:** 1 KG\n- 🧅 **Onions:** 500g\n- 🧈 **Butter:** 1 Block\n- 🧴 **Mayonnaise & Ketchup**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Burger' to add all required ingredients to your cart in 1-click!";
  }

  if (q.includes("kheer") || q.includes("کھیر")) {
    return isUr
      ? "🥣 **لذیذ کھیر کی مکمل ریسپی اور درکار اجزاء:**\n- 🥛 **خالص دودھ (Whole Milk):** 1 پیکٹ\n- 🌾 **سفید چاول (White Rice):** 1 کلو\n- 🍬 **چینی (Sugar):** 1 پیکٹ\n- 🧈 **مکھن (Butter):** 1 بلاک\n- 🌰 **خشک میوہ جات اور الائچی**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Kheer' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
      : "🥣 **Sweet Kheer Recipe & Complete Ingredients:**\n- 🥛 **Whole Milk:** 1 Pack\n- 🌾 **White Rice:** 1 KG\n- 🍬 **Sugar:** 1 Pack\n- 🧈 **Butter:** 1 Block\n- 🌰 **Dry Fruits & Cardamom:** For aroma\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Kheer' to add all required ingredients to your cart in 1-click!";
  }

  if (q.includes("chai") || q.includes("tea") || q.includes("چائے")) {
    return isUr
      ? "☕ **کڑک چائے کی مکمل ریسپی اور درکار اجزاء:**\n- 🥛 **خالص دودھ (Whole Milk):** 1 پیکٹ\n- ☕ **سبز / کالی چائے پتی (Green Tea):** 1 ڈبہ\n- 🍬 **چینی (Sugar):** 1 پیکٹ\n- 🫚 **ادرک اور الائچی**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Chai' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
      : "☕ **Special Chai/Tea Recipe & Complete Ingredients:**\n- 🥛 **Whole Milk:** 1 Pack\n- ☕ **Green Tea / Black Tea Leaf:** 1 Box\n- 🍬 **Sugar:** 1 Pack\n- 🫚 **Ginger & Cardamom (Elaichi):** For flavor\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Chai' to add all required ingredients to your cart in 1-click!";
  }

  if (q.includes("fried rice") || q.includes("فرائیڈ رائس")) {
    return isUr
      ? "🍚 **انڈہ فرائیڈ رائس کی مکمل ریسپی اور درکار اجزاء:**\n- 🥚 **انڈے (Eggs):** 1 درجن\n- 🌾 **چاول (White Rice):** 1 کلو\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 1 لیٹر\n- 🧅 **پیاز (Onions):** 500 گرام\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🍾 **سویا ساس، سرکہ اور لہسن**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Fried Rice' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
      : "🍚 **Egg Fried Rice Recipe & Complete Ingredients:**\n- 🥚 **Eggs:** 1 Dozen\n- 🌾 **White Rice:** 1 KG\n- 🛢️ **Cooking Oil:** 1 Liter\n- 🧅 **Onions:** 500g\n- 🧂 **Salt:** 1 Pack\n- 🍾 **Soy Sauce, Vinegar & Garlic**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Fried Rice' to add all required ingredients to your cart in 1-click!";
  }

  if (q.includes("omelette") || q.includes("omlet") || q.includes("آملیٹ")) {
    return isUr
      ? "🍳 **لذیذ آملیٹ کی مکمل ریسپی اور درکار اجزاء:**\n- 🥚 **انڈے (Eggs):** 1 درجن\n- 🧅 **پیاز (Onions):** 500 گرام\n- 🍅 **ٹماٹر (Tomatoes):** 500 گرام\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 1 لیٹر\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🌶️ **ہری مرچ، ہرا دھنیا اور کالی مرچ**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Omelette' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
      : "🍳 **Egg Omelette Recipe & Complete Ingredients:**\n- 🥚 **Eggs:** 1 Dozen\n- 🧅 **Onions:** 500g\n- 🍅 **Tomatoes:** 500g\n- 🛢️ **Cooking Oil:** 1 Liter\n- 🧂 **Salt:** 1 Pack\n- 🌶️ **Green Chillies, Coriander & Black Pepper**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Omelette' to add all required ingredients to your cart in 1-click!";
  }

  if (q.includes("pulao") || q.includes("پلاؤ") || q.includes("پلاو")) {
    return isUr
      ? "🥘 **لذیذ چکن پلاؤ کی مکمل ریسپی اور درکار اجزاء:**\n- 🍗 **چکن (Chicken Breast):** 1 کلو\n- 🌾 **چاول (White Rice):** 1 کلو\n- 🧅 **پیاز (Onions):** 1 کلو\n- 🍅 **ٹماٹر (Tomatoes):** 1 کلو\n- 🥔 **آلو (Potatoes):** 1 کلو\n- 🛢️ **کوکنگ آئل (Cooking Oil):** 1 لیٹر\n- 🧂 **نمک (Salt):** 1 پیکٹ\n- 🌶️ **پلاؤ مصالحہ جات اور ادرک لہسن پیسٹ**\n\n💡 **طریقہ:** **Catalog** ٹیب میں 'Pulao' سرچ کریں اور تمام اجزاء ایک کلک میں کارٹ میں شامل کریں!"
      : "🥘 **Chicken Pulao Recipe & Complete Ingredients:**\n- 🍗 **Chicken Breast:** 1 KG\n- 🌾 **White Rice:** 1 KG\n- 🧅 **Onions:** 1 KG\n- 🍅 **Tomatoes:** 1 KG\n- 🥔 **Potatoes:** 1 KG\n- 🛢️ **Cooking Oil:** 1 Liter\n- 🧂 **Salt:** 1 Pack\n- 🌶️ **Pulao Whole Spices & Ginger Garlic Paste**\n\n💡 **Tip:** Go to the **Catalog** tab and search 'Pulao' to add all required ingredients to your cart in 1-click!";
  }

  if (q.includes("recipe") || q.includes("ingredient") || q.includes("dish") || q.includes("ترکیب") || q.includes("ریسپی") || q.includes("ڈش")) {
    return isUr
      ? "🍝 **ریسپی دیکھنے اور سمارٹ ریسپی سرچ کا طریقہ (View Recipe):**\n1. **Catalog** ٹیب پر جائیں۔\n2. سرچ بار میں کسی بھی ڈش کا نام درج کریں (مثلاً: *Biryani, Karahi, Nihari, Pasta, Pizza, Cake*)۔\n3. VoxCart کا سمارٹ ریسپی انجن آپ کو ڈش کی ریسپی کی تفصیلات اور درکار تمام اجزاء دکھائے گا۔\n4. **'Add All Recipe Ingredients'** بٹن پر کلک کر کے تمام اجزاء ایک ساتھ کارٹ میں شامل کریں!"
      : "🍝 **How to View Recipes & Smart Recipe Search:**\n1. Navigate to the **Catalog** tab.\n2. Search for any dish or recipe name in the search bar (e.g., *Biryani, Karahi, Nihari, Pasta, Pizza, Cake*).\n3. VoxCart's Smart Recipe Engine brings up the full recipe breakdown and all required store ingredients.\n4. Click **'Add All Recipe Ingredients'** to put all required grocery items into your shopping cart in 1-click!";
  }

  if (q.includes("voice switch") || q.includes("language") || q.includes("urdu") || q.includes("english") || q.includes("roman") || q.includes("toggle") || q.includes("speak") || q.includes("mic") || q.includes("زبان") || q.includes("سویچ") || q.includes("اردو") || q.includes("صوتی")) {
    return isUr
      ? "🎙️ **صوتی اور زبان کی سوئچنگ (Voice Switch & Language Toggle):**\n1. **زبان تبدیلی:** ویب سائٹ کے بالکل اوپر ہیڈر میں موجود **'Urdu / English'** بٹن پر کلک کر کے پوری ویب سائٹ کو مکمل اردو یا انگریزی میں سوئچ کریں۔\n2. **صوتی اسسٹنٹ:** **Voice Assistant** ٹیب پر جائیں یا ہیڈر کے **مائیکروفون آئیکن** پر کلک کریں۔\n3. مائیک آن کر کے انگریزی، اردو، یا رومن اردو میں صوتی آرڈر دیں (مثلاً: *'دو کلو آٹا اور ایک کلو سیب شامل کرو'*)"
      : "🎙️ **How to Use Voice Switch & Language Toggle:**\n1. **Language Switch:** Click the **'Urdu / English'** toggle button in the top website header to instantly switch the entire app interface between English and Urdu.\n2. **Voice Assistant Switch:** Click the **Voice Assistant** tab in the main navigation or tap the **microphone icon** in the header.\n3. Turn on the mic and speak naturally in English, Urdu, or Roman Urdu (e.g., *'Add 2 kg flour and 1 kg apples'*). VoxCart will dictate and add items automatically!";
  }

  if (q.includes("suggestion") || q.includes("recommend") || q.includes("smart") || q.includes("auto suggest") || q.includes("تجویز") || q.includes("پیشکش") || q.includes("ای آئی")) {
    return isUr
      ? "✨ **سمارٹ تجویزات اور AI خصوصیات (Smart Suggestions):**\n1. **AI ریسپی تجویزات:** جب آپ کیٹلاگ میں کسی ڈش کو تلاش کرتے ہیں، والکس کارٹ خود بخود متعلقہ اجزاء کی تجویز پیش کرتا ہے۔\n2. **صوتی سمارٹ میچنگ:** Voice Assistant آپ کے جملے سے پروڈکٹس اور مقدار خود بخود سمارٹ انداز میں الگ کر کے کارٹ میں ڈالتا ہے۔\n3. **سمارٹ فلٹرز:** ہوم اور کیٹلاگ پیج پر مقبول ترین اور باقاعدہ خریدی جانے والی اشیاء کی سمارٹ لسٹ موجود ہے!"
      : "✨ **How Smart Suggestions & AI Features Work:**\n1. **AI Recipe Suggestions:** When searching dishes in the Catalog, VoxCart intelligently suggests all necessary cooking ingredients.\n2. **Voice Smart Extraction:** The Voice Assistant uses AI natural language parsing to automatically detect product names, quantities, and units from your speech.\n3. **Smart Product Suggestions:** Browse popular and frequently bought items on the Home & Catalog tabs tailored to your shopping preferences!";
  }

  if (q.includes("scan") || q.includes("ocr") || q.includes("bill") || q.includes("receipt") || q.includes("upload list") || q.includes("اسکین") || q.includes("رسید") || q.includes("تصویر")) {
    return isUr
      ? "📷 **بل اور کاغذی فہرست اسکین کرنے کا طریقہ (OCR Bill Scanner):**\n1. **Voice Assistant** ٹیب پر جائیں اور نیچے **Invoice / Bill Scanner** سیکشن تک سکرول کریں۔\n2. اپنے کاغذی بل یا ہاتھ سے لکھی شاپنگ لسٹ کی تصویر اپ لوڈ کریں۔\n3. ہمارا AI OCR اسکینر تصویر میں لکھی تمام اشیاء کو پڑھ کر فوراً کارٹ میں تبدیل کر دے گا!"
      : "📷 **How to Use OCR Bill & Receipt Scanner:**\n1. Go to the **Voice Assistant** tab and scroll down to the **Invoice / Bill Scanner** section.\n2. Upload an image or photo of a printed store receipt or handwritten grocery list.\n3. Our AI OCR vision scanner extracts listed products and lets you add them directly to your shopping cart!";
  }

  if ((q.includes("my order") || q.includes("order status") || q.includes("track my order") || q.includes("where is my order") || q.includes("میرے آرڈر") || q.includes("اسٹیٹس")) && Array.isArray(orders) && orders.length > 0) {
    const list = orders.map(o => `- Order #${o.id || o.orderId} | Total: ${o.total} ${o.currency || currency} | Status: **${o.status || 'Pending'}**`).join("\n");
    return isUr
      ? `📦 **آپ کے جاری اور حالیہ آرڈرز:**\n${list}\n\nتفصیلی رسید اور ٹریکنگ کے لیے **Orders** ٹیب پر دیکھیں۔`
      : `📦 **Your Active Orders & Tracking Status:**\n${list}\n\nNavigate to the **Orders** tab to download official PDF invoices or track delivery status in real-time!`;
  }

  if (q.includes("order") || q.includes("track") || q.includes("status") || q.includes("invoice") || q.includes("history") || q.includes("آرڈر") || q.includes("رسید")) {
    return isUr
      ? "🧾 **آرڈر ٹریکنگ اور رسید دیکھنے کا طریقہ:**\n1. اوپر نیویگیشن بار میں **Orders** (یا آرڈرز) ٹیب پر کلک کریں۔\n2. وہاں آپ کو اپنے تمام موجودہ اور سابقہ آرڈرز کی لائیو ٹریکنگ (Pending ➔ Shipped ➔ Delivered) نظر آئے گی۔\n3. آپ کسی بھی آرڈر کے ساتھ موجود **'PDF Invoice'** بٹن سے آفیشل بل ڈاؤن لوڈ یا پرنٹ بھی کر سکتے ہیں!"
      : "🧾 **How to Track Your Orders & View Invoices:**\n1. Click on the **Orders** tab in the top navigation bar.\n2. You will see real-time status updates for all your orders (Pending ➔ Shipped ➔ Delivered).\n3. You can also view, print, or download official PDF invoices for any order by clicking the **PDF Invoice** button!";
  }

  if ((q.includes("my cart") || q.includes("in my cart") || q.includes("cart items") || q.includes("میرے کارٹ") || q.includes("کارٹ میں کیا")) && Array.isArray(cartItems) && cartItems.length > 0) {
    const itemsList = cartItems.map(c => `- ${c.name || 'Product'} (Qty: ${c.qty || 1})`).join("\n");
    return isUr
      ? `🛒 **آپ کا شاپنگ کارٹ:**\n${itemsList}\n\nچیک آؤٹ کے لیے ہیڈر میں کارٹ آئیکن پر کلک کریں!`
      : `🛒 **Items Currently in Your Cart:**\n${itemsList}\n\nClick the cart icon at top right to proceed to checkout!`;
  }

  if ((q.includes("add") && (q.includes("cart") || q.includes("basket"))) || q.includes("how to buy") || q.includes("ارٹ") || q.includes("خرید")) {
    return isUr
      ? "🛒 **کارٹ میں اشیاء شامل کرنے کا طریقہ:**\n1. **Manual:** **Catalog** یا **Home** پیج پر کسی بھی پروڈکٹ کے نیچے **'Add to Cart'** (یا ➕) بٹن دبائیں۔\n2. **Voice:** **Voice Assistant** پیج یا ہیڈر مائیک پر کلک کریں اور صوتی انداز میں بولیں (مثلاً: *'دو کلو سیب کارٹ میں ڈالو'*)\n3. **Recipe 1-Click:** کیٹلاگ میں کسی ریسپی کا نام سرچ کر کے تمام اجزاء ایک ساتھ کارٹ میں شامل کریں!"
      : "🛒 **How to Add Items to Your Cart:**\n1. **Manual:** Go to the **Catalog** tab, browse or search for any item, and click **'Add to Cart'** (or the ➕ button).\n2. **Voice Dictation:** Go to the **Voice Assistant** tab or click the microphone icon in the header, then speak naturally (e.g., *'Add 2 kg bananas and 1 carton of milk'*).\n3. **Recipe 1-Click:** Search for a dish name (e.g., *Biryani*) in the Catalog search bar to automatically add all required grocery ingredients to your cart!";
  }

  if (q.includes("checkout") || q.includes("place order") || q.includes("payment") || q.includes("pay") || q.includes("cod") || q.includes("card") || q.includes("easypaisa") || q.includes("jazzcash") || q.includes("چیک آؤٹ") || q.includes("ادائیگی")) {
    return isUr
      ? "💳 **چیک آؤٹ اور ادائیگی کے طریقے:**\n1. اوپر دائیں طرف کارٹ آئیکن پر کلک کر کے اپنا شاپنگ کارٹ دیکھیں۔\n2. اشیاء کی تصدیق کے بعد **'Proceed to Checkout'** پر کلک کریں۔\n3. اپنا ڈیلیوری پتہ درج کریں اور ادائیگی کا طریقہ منتخب کریں:\n   - کیش آن ڈیلیوری (COD)\n   - کریڈٹ و ڈیبٹ کارڈز (Visa / Mastercard)\n   - ایزی پیسہ / جاز کیش (EasyPaisa / JazzCash)\n   - ڈائریکٹ بینک ٹرانسفر\n4. **'Place Order'** پر کلک کریں! آپ کو فوراً تصدیق اور PDF انوائس مل جائے گی۔"
      : "💳 **How to Checkout & Payment Options:**\n1. Open your shopping cart by clicking the cart icon at the top right of the header.\n2. Review your selected items and click **'Proceed to Checkout'**.\n3. Enter your delivery address and choose a payment method:\n   - Cash on Delivery (COD)\n   - Credit & Debit Cards (Visa / Mastercard)\n   - Mobile Wallets (EasyPaisa & JazzCash)\n   - Direct Bank Transfer\n4. Click **'Place Order'** to finalize! You will receive instant confirmation and a downloadable PDF invoice.";
  }

  if (q.includes("search") || q.includes("find") || q.includes("filter") || q.includes("تلاش")) {
    return isUr
      ? "🔍 **پروڈکٹس اور سمارٹ سرچ:**\n1. **Catalog** ٹیب پر جائیں۔\n2. سرچ بار میں کسی بھی پروڈکٹ کا نام (سیب، آٹا، دودھ) یا ڈش کا نام درج کریں۔\n3. کیٹیگری فلٹرز کا استعمال کریں۔"
      : "🔍 **How to Search & Filter Products:**\n1. Navigate to the **Catalog** tab.\n2. Type any item name (e.g., *Milk, Apples*) or recipe dish name into the search bar.\n3. Use category filter buttons to narrow down choices.";
  }

  if (q.includes("deliver") || q.includes("shipping") || q.includes("fee") || q.includes("charge") || q.includes("دیلیوری") || q.includes("ڈلیوری")) {
    return isUr
      ? "🚚 **ڈیلیوری کی معلومات:**\n- **وقت:** تمام آرڈرز 24-48 گھنٹوں میں ڈیلیور ہوتے ہیں۔\n- **مفت ڈیلیوری:** $10 / PKR 2,000 سے اوپر کے تمام آرڈرز پر ڈیلیوری چارجز مفت ہیں!\n- **ٹریکنگ:** آپ **Orders** کے ٹیب سے اپنے آرڈر کا لائیو اسٹیٹس چیک کر سکتے ہیں۔"
      : "🚚 **Delivery Information:**\n- **Delivery Time:** Standard delivery arrives within 24-48 hours.\n- **Free Shipping:** All orders above $10 USD or PKR 2,000 qualify for FREE delivery!\n- **Tracking:** Real-time order progress can be tracked in the **Orders** tab.";
  }

  if (q.includes("refund") || q.includes("return") || q.includes("policy") || q.includes("damaged") || q.includes("واپسی") || q.includes("ریفنڈ")) {
    return isUr
      ? "🔄 **ریفنڈ اور واپسی کی پالیسی:**\nاگر کسی پروڈکٹ میں کوئی خرابی ہو تو آپ 24 گھنٹوں کے اندر واپسی کی درخواست کر سکتے ہیں۔ آپ کی رقم 3-5 دنوں میں واپس کر دی جائے گی۔"
      : "🔄 **Returns & Refund Policy:**\nWe offer a 24-hour return window for fresh produce or damaged items. Once processed, full refunds are issued to your payment method within 3-5 business days.";
  }

  if (q.includes("account") || q.includes("login") || q.includes("register") || q.includes("admin") || q.includes("password") || q.includes("لاگ ان")) {
    return isUr
      ? "👤 **یوزر اور ایڈمن اکاؤنٹس:**\n- گاہک لاگ ان کیے بغیر یا نیا اکاؤنٹ بنا کر خریداری کر سکتے ہیں۔\n- ایڈمن کنٹرول کے لیے **Admin** ٹیب پر جائیں (لاگ ان: admin@voxcart.com / admin)"
      : "👤 **User Accounts & Admin Console:**\n- Customers can shop as a Guest or Register an account to save delivery addresses and cart state.\n- **Admin Console:** Managers can access the Admin tab (`admin@voxcart.com` / `admin`) to update inventory, stock, and orders.";
  }

  if (q.includes("currency") || q.includes("pkr") || q.includes("usd") || q.includes("کرنسی")) {
    return isUr
      ? "🌐 **کرنسی تبدیل کرنے کا طریقہ:**\nویب سائٹ کے نیویگیشن بار میں موجود کرنسی ڈراپ ڈاؤن سے USD $, PKR ₨, EUR €, GBP £, SAR ﷼, یا AED منتخب کریں!"
      : "🌐 **How to Switch Currency:**\nClick the currency dropdown selector in the top header navigation to view prices in USD $, PKR ₨, EUR €, GBP £, SAR, or AED with real-time conversion!";
  }

  // 4. DYNAMIC PRODUCT SEARCH & PRODUCT PRICE MATCHING
  if (Array.isArray(products) && products.length > 0) {
    const activeProds = products.filter(p => p.status !== "Inactive");
    const queryLower = q.toLowerCase();
    
    const ignoreWords = new Set([
      "what", "is", "are", "the", "a", "an", "price", "prices", "cost", "costs", "rate", "rates", "of", "how", "much", "many", "does", "do",
      "you", "have", "sell", "show", "me", "list", "available", "tell", "about", "for", "in", "store", "voxcart", "can",
      "buy", "give", "item", "product", "items", "products", "where", "to", "see", "view", "find", "track", "tracking",
      "order", "orders", "my", "your", "our", "history", "cart", "basket", "checkout", "pay", "payment", "account",
      "profile", "page", "tab", "go", "nav", "navigate", "help", "kya", "hai", "kaise", "chahiye", "کتنی", "کتنا",
      "قیمت", "کیا", "ہے", "بتاؤ", "سے", "پر", "روپے", "کتنے"
    ]);

    const words = queryLower.split(/[^a-zA-Z0-9\u0600-\u06FF]+/).filter(w => w.length >= 3 && !ignoreWords.has(w));

    let matchedProducts = activeProds.filter(p => {
      const pName = (p.name || "").toLowerCase();
      const pUr = (p.nameUr || "").toLowerCase();

      if (pName && queryLower.includes(pName)) return true;
      if (pUr && queryLower.includes(pUr)) return true;

      if (words.length === 0) return false;

      const pWords = pName.split(/\s+/).filter(w => w.length >= 2);
      const pUrWords = pUr.split(/\s+/).filter(w => w.length >= 2);

      return words.some(w => 
        pWords.some(pw => pw === w || (w.length >= 4 && (pw.startsWith(w) || w.startsWith(pw)))) ||
        pUrWords.some(pu => pu === w || (w.length >= 4 && (pu.startsWith(w) || w.startsWith(pu))))
      );
    });

    if (matchedProducts.length > 0) {
      if (matchedProducts.length === 1) {
        const p = matchedProducts[0];
        const unitLabel = isUr ? (p.unitUr || "پیکٹ") : (p.unit || "pack");
        const stockStatus = p.stockQuantity > 0 
          ? (isUr ? `✅ اسٹاک میں موجود (${p.stockQuantity} دستیاب)` : `✅ In Stock (${p.stockQuantity} available)`)
          : (isUr ? "❌ آؤٹ آف اسٹاک" : "❌ Out of Stock");

        return isUr
          ? `🛍️ **${p.name} (${p.nameUr || p.name})**\n- **قیمت:** ${fmt(p.price, p.currencyCode)} فی ${unitLabel}\n- **کیٹیگری:** ${p.category}\n- **اسٹیٹس:** ${stockStatus}\n\n💡 آپ **Catalog** یا **Home** ٹیب پر جا کر اسے کارٹ میں ڈال سکتے ہیں!`
          : `🛍️ **${p.name}**\n- **Price:** ${fmt(p.price, p.currencyCode)} per ${unitLabel}\n- **Category:** ${p.category}\n- **Availability:** ${stockStatus}\n\n💡 You can find this in the **Catalog** or **Home** tab to add it to your cart!`;
      } else {
        const listStr = matchedProducts.slice(0, 5).map(p =>
          `• **${p.name}** ${p.nameUr ? `(${p.nameUr})` : ''}: **${fmt(p.price, p.currencyCode)}** / ${isUr ? (p.unitUr || 'پیکٹ') : (p.unit || 'pack')}`
        ).join("\n");

        return isUr
          ? `🔍 **آپ کی سرچ سے ملتی جلتی اشیاء:**\n\n${listStr}\n\n💡 مزید دیکھنے کے لیے **Catalog** ٹیب میں تلاش کریں!`
          : `🔍 **Matching Items Found:**\n\n${listStr}\n\n💡 Visit the **Catalog** tab to view details and add items to your cart!`;
      }
    }
  }

  // General fallback
  return isUr
    ? "ہمم! میں والکس کارٹ کا اسسٹنٹ ہوں۔ 🤖 آپ ویب سائٹ کی نیویگیشن، آرڈرز، پروڈکٹس، یا پیمنٹ کے بارے میں کچھ بھی پوچھ سکتے ہیں۔ یا کیٹلاگ میں سے پروڈکٹ کا نام تلاش کریں!"
    : "Hmm! I'm VoxBot, your VoxCart shopping assistant. 🤖 Ask me about store categories, products, prices, voice orders, tracking, or website navigation! Or try searching in the **Catalog** tab.";
}

const FAQ_PRESETS = [
  {
    id: "all_cats",
    icon: "🏷️",
    group: "Categories",
    labelEn: "All Categories & Subcategories",
    labelUr: "تمام کیٹیگریز و ذیلی اقسام",
    queryEn: "What product categories and subcategories are available in store?",
    queryUr: "سٹور میں کون کون سی پروڈکٹ کیٹیگریز اور ذیلی کیٹیگریز دستیاب ہیں؟"
  },
  {
    id: "dairy",
    icon: "🥛",
    group: "Categories",
    labelEn: "Dairy & Eggs",
    labelUr: "دودھ اور انڈے",
    queryEn: "What products are available in Dairy & Eggs?",
    queryUr: "دودھ اور انڈوں کی کیٹیگری میں کیا اشیاء ہیں؟"
  },
  {
    id: "fruits",
    icon: "🍎",
    group: "Categories",
    labelEn: "Fresh Fruits",
    labelUr: "تازہ پھل",
    queryEn: "What fresh fruits are available in store?",
    queryUr: "سٹور میں کون سے تازہ پھل دستیاب ہیں؟"
  },
  {
    id: "veg",
    icon: "🥦",
    group: "Categories",
    labelEn: "Vegetables",
    labelUr: "تازہ سبزیاں",
    queryEn: "What fresh vegetables do you carry?",
    queryUr: "آپ کے پاس کون سی تازہ سبزیاں ہیں؟"
  },
  {
    id: "meat",
    icon: "🥩",
    group: "Categories",
    labelEn: "Meat & Seafood",
    labelUr: "گوشت اور مچھلی",
    queryEn: "What meat and seafood items are in stock?",
    queryUr: "گوشت اور مچھلی کی کیٹیگری میں کیا چیزیں ہیں؟"
  },
  {
    id: "beverages",
    icon: "🥤",
    group: "Categories",
    labelEn: "Beverages & Drinks",
    labelUr: "مشروبات اور چائے",
    queryEn: "What beverages, soft drinks, and teas are available?",
    queryUr: "مشروبات، کولڈ ڈرنکس اور چائے میں کیا دستیاب ہے؟"
  },
  {
    id: "pantry",
    icon: "🌾",
    group: "Categories",
    labelEn: "Pantry & Staples",
    labelUr: "پنساری اور راشن",
    queryEn: "What pantry items, rice, oil, and spices do you have?",
    queryUr: "پنساری، چاول، آئل اور مصالحوں میں کیا موجود ہے؟"
  },
  {
    id: "fav",
    icon: "❤️",
    group: "Features",
    labelEn: "Add to Favorites",
    labelUr: "پسندیدہ اشیاء",
    queryEn: "How do I add items to Favorites?",
    queryUr: "پسندیدہ اشیاء کیسے محفوظ کریں؟"
  },
  {
    id: "recipe",
    icon: "🍝",
    group: "Features",
    labelEn: "View Recipe",
    labelUr: "سمارٹ ریسپی سرچ",
    queryEn: "How do I view recipes and search ingredients?",
    queryUr: "ریسپی اور درکار اجزاء کیسے دیکھیں؟"
  },
  {
    id: "voice",
    icon: "🎙️",
    group: "Features",
    labelEn: "Voice Switch",
    labelUr: "صوتی اسسٹنٹ و زبان",
    queryEn: "How to use Voice Switch and language toggle?",
    queryUr: "صوتی اسسٹنٹ اور زبان کا انتخاب کیسے کریں؟"
  },
  {
    id: "suggest",
    icon: "✨",
    group: "Features",
    labelEn: "Smart Suggestions",
    labelUr: "سمارٹ تجویزات",
    queryEn: "What are AI Smart Suggestions and how do they work?",
    queryUr: "ای آئی سمارٹ تجویزات کیا ہیں؟"
  },
  {
    id: "ocr",
    icon: "📷",
    group: "Features",
    labelEn: "Bill Scanner",
    labelUr: "بل و رسید اسکینر",
    queryEn: "How to scan a grocery bill or handwritten list?",
    queryUr: "کاغذی بل یا ہاتھ سے لکھی لسٹ کیسے اسکین کریں؟"
  },
  {
    id: "track",
    icon: "🧾",
    group: "Orders",
    labelEn: "Track Order & PDF",
    labelUr: "آرڈر ٹریکنگ و بل",
    queryEn: "How to track orders and download PDF invoices?",
    queryUr: "آرڈر کیسے ٹریک کریں اور پی ڈی ایف بل حاصل کریں؟"
  },
  {
    id: "cart",
    icon: "🛒",
    group: "Shopping",
    labelEn: "Add to Cart",
    labelUr: "کارٹ اور خریداری",
    queryEn: "How do I add items to cart and place an order?",
    queryUr: "اشیاء کارٹ میں کیسے شامل کریں اور خریدیں؟"
  },
  {
    id: "payment",
    icon: "💳",
    group: "Checkout",
    labelEn: "Checkout & Pay",
    labelUr: "چیک آؤٹ و ادائیگی",
    queryEn: "What payment methods are supported at checkout?",
    queryUr: "ادائیگی اور چیک آؤٹ کے کون سے طریقے موجود ہیں؟"
  },
  {
    id: "delivery",
    icon: "🚚",
    group: "Policies",
    labelEn: "Delivery & Refund",
    labelUr: "ڈیلیوری و ریفنڈ",
    queryEn: "What is the delivery time, shipping fee, and return policy?",
    queryUr: "ڈیلیوری کی فیس، وقت اور ریفنڈ پالیسی کیا ہے؟"
  },
  {
    id: "currency",
    icon: "🌐",
    group: "Settings",
    labelEn: "Currency & Language",
    labelUr: "کرنسی و زبان",
    queryEn: "How to change currency or language on website?",
    queryUr: "ویب سائٹ کی زبان اور کرنسی کیسے تبدیل کریں؟"
  },
  {
    id: "account",
    icon: "👤",
    group: "Accounts",
    labelEn: "User & Admin Account",
    labelUr: "اکاؤنٹ اور ایڈمن",
    queryEn: "How do user accounts and admin login work?",
    queryUr: "یوزر اکاؤنٹ اور ایڈمن لاگ ان کیسے کام کرتا ہے؟"
  }
];

export default function AIChatbotWidget({ lang = "en", currency = "USD", activeTab = "home", user = null, onNavigate, products = [], onCategoryExtracted, onAddItems, onNotify }) {
  const isUr = lang === "ur";
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTeaser, setShowTeaser] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const [showFaqDrawer, setShowFaqDrawer] = useState(false);
  const [faqSearchQuery, setFaqSearchQuery] = useState("");
  const [faqSelectedGroup, setFaqSelectedGroup] = useState("All");

  // Initial welcome message
  const getInitialMessages = () => [
    {
      id: "msg_welcome",
      sender: "bot",
      text: isUr 
        ? "سلام! 👋 میں والکس کارٹ کا **VoxBot AI** اسسٹنٹ ہوں۔ میں آپ کو پروڈکٹس، صوتی شاپنگ، ریسپی سرچ، پسندیدہ اشیاء، اور ویب سائٹ کے تمام فیچرز کے بارے میں معلومات فراہم کر سکتا ہوں۔ نیچے دیئے گئے تجویز کردہ سوالات پر کلک کریں یا اپنا سوال ٹائپ کریں!"
        : "Hi there! 👋 I'm **VoxBot**, your VoxCart AI Shopping Assistant. I can help you explore all website features including **Add to Favorites**, **View Recipe**, **Voice Switch**, **Smart Suggestions**, and **Order Tracking**. Click any suggested FAQ below or type your question!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: FAQ_PRESETS.map(faq => ({
        label: `${faq.icon} ${isUr ? faq.labelUr : faq.labelEn}`,
        text: isUr ? faq.queryUr : faq.queryEn
      }))
    }
  ];

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("voxcart_chatbot_messages");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse chatbot history:", e);
    }
    return getInitialMessages();
  });

  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const faqScrollRef = useRef(null);

  const scrollFaqToolbar = (direction) => {
    if (faqScrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      faqScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Save chat history locally
  useEffect(() => {
    try {
      localStorage.setItem("voxcart_chatbot_messages", JSON.stringify(messages.slice(-30)));
    } catch (e) {
      console.warn("Could not cache chatbot messages", e);
    }
  }, [messages]);

  // Scroll to bottom when new messages arrive or when chat opens
  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen, isTyping]);

  // Focus input when chat window opens
  useEffect(() => {
    if (isOpen) {
      setShowTeaser(false);
      setHasUnread(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  // Hide teaser automatically after 12 seconds if unopened
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTeaser(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMsg = {
      id: "usr_" + Date.now(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Build history payload for context-awareness
      const chatHistory = messages.map(m => ({
        sender: m.sender,
        text: m.text
      })).slice(-8);

      let botReplyText = "";
      let handledByVoiceParser = false;
      let resolvedRecipeItems = [];

      // Check if message is a recipe/shopping voice command
      const parsedCmd = parseVoiceCommand(query, products);
      if (parsedCmd && parsedCmd.action === "update_items" && parsedCmd.items && parsedCmd.items.length > 0 && onAddItems) {
        const resolvedItems = [];
        const latestProducts = [...(products || [])];

        parsedCmd.items.forEach(item => {
          const searchId = item.productId || item.id;
          let match = null;
          if (searchId) {
            match = latestProducts.find(p => String(p.id) === String(searchId));
          }
          if (!match && item.name) {
            match = latestProducts.find(p => p.name.toLowerCase() === item.name.toLowerCase() || p.nameUr === item.nameUr);
          }
          
          const originallyMatched = match 
            ? !!(match.status !== "Inactive" && match.status !== "Unavailable" && match.status?.toLowerCase() !== "inactive" && match.status?.toLowerCase() !== "unavailable" && (match.stockQuantity === undefined || match.stockQuantity > 0) && match.price > 0)
            : (item.matched === true);

          if (originallyMatched && match) {
            const rawId = match.id;
            const resolvedId = isNaN(Number(rawId)) ? rawId : Number(rawId);
            resolvedItems.push({
              productId: resolvedId,
              qty: item.qty || 1,
              action: item.action || "add"
            });
          }
        });

        if (resolvedItems.length > 0) {
          onAddItems(resolvedItems);
          const count = resolvedItems.length;
          const isUrQuery = lang === "ur" || /[\u0600-\u06FF]/.test(query);
          const isRecipeRequest = query.toLowerCase().includes("recipe") || query.toLowerCase().includes("ingredient") || query.toLowerCase().includes("cook") || query.toLowerCase().includes("make") || query.toLowerCase().includes("ترکیب") || query.toLowerCase().includes("ریسپی") || query.toLowerCase().includes("ڈش");

          if (isRecipeRequest) {
            resolvedRecipeItems = resolvedItems;
            handledByVoiceParser = false; // Do NOT block the chatbot from rendering the detailed recipe response text!
          } else {
            if (isUrQuery) {
              botReplyText = `🛒 **میں نے آپ کے آرڈر کے مطابق ${count} دستیاب چیزیں خودکار طور پر کارٹ میں شامل کر دی ہیں!**\n\nآپ کسی بھی وقت چیک آؤٹ صفحہ پر جا کر آرڈر مکمل کر سکتے ہیں۔`;
            } else {
              botReplyText = `🛒 **I have automatically added ${count} available ingredients/items for you to the cart!**\n\nYou can review your active cart and checkout whenever you are ready.`;
            }
            if (onNotify) {
              onNotify(isUrQuery ? "مصنوعات کارٹ میں شامل کر دی گئیں!" : "Ingredients successfully added to cart!", "success");
            }
            handledByVoiceParser = true;
          }
        }
      }

      if (!handledByVoiceParser) {
        // Call backend AI Chatbot endpoint
        let res = null;
        try {
          res = await api.sendChatMessage(query, chatHistory, lang, currency, activeTab, user ? user.id : null);
        } catch (e) {
          console.warn("Backend chatbot API unavailable or failed, generating dynamic answer client-side:", e);
        }
        
        if (res && res.reply) {
          botReplyText = res.reply;
        } else {
          botReplyText = generateDynamicClientResponse(query, lang, products);
        }

        // If this was a recipe request and items were added in the background, append dynamic notification to the bot reply text
        if (resolvedRecipeItems.length > 0) {
          const isUrQuery = lang === "ur" || /[\u0600-\u06FF]/.test(query);
          const count = resolvedRecipeItems.length;
          if (isUrQuery) {
            botReplyText += `\n\n🛒 **اسمارٹ فیچر:** میں نے اس ریسیپی کے تمام **${count} دستیاب اجزاء** خودکار طور پر آپ کی کارٹ میں شامل کر دیے ہیں تاکہ آپ انہیں 1-کلک میں خرید سکیں!`;
          } else {
            botReplyText += `\n\n🛒 **Smart Feature:** I have also automatically put all **${count} available recipe ingredients** into your shopping cart for 1-click convenience!`;
          }
          if (onNotify) {
            onNotify(isUrQuery ? "ریسپی کے تمام اجزاء کارٹ میں شامل!" : "Recipe ingredients successfully added to cart!", "success");
          }
        }

        // Handle extracted user categories
        if (res && res.extractedCategories && res.extractedCategories.length > 0) {
          if (user) {
            if (onCategoryExtracted) onCategoryExtracted();
            const catNames = res.extractedCategories.map(c => c.name).join(", ");
            botReplyText += isUr
              ? `\n\n✨ **نئی کیٹیگریز خودکار طور پر تیار کی گئیں:** ${catNames}\nیہ کیٹیگریز آپ کے لاگ ان اکاؤنٹ میں محفوظ کر دی گئی ہیں اور **Catalog** میں نمایاں ہیں۔`
              : `\n\n✨ **New Categories Extracted Automatically:** ${catNames}\nThese categories are saved to your logged-in account and are visible in your **Catalog**!`;
          } else {
            const catNames = res.extractedCategories.map(c => c.name).join(", ");
            botReplyText += isUr
              ? `\n\n🔒 **نوٹ:** AI نے کیٹیگریز (${catNames}) دریافت کی ہیں۔ نئی کیٹیگریز صرف لاگ ان کے بعد ڈسپلے ہوتی ہیں اور ایڈمن سائڈ پر نظر نہیں آئیں گی۔ براہ کرم لاگ ان کریں۔`
              : `\n\n🔒 **Note:** AI extracted categories (${catNames}). Extracted categories are displayed only after you log in and remain hidden from the admin panel. Please log in to view them!`;
          }
        }
      }

      // Check if reply mentions specific tabs for quick action buttons
      const navSuggestions = [];
      const lowerReply = botReplyText.toLowerCase();
      if (lowerReply.includes("catalog") || lowerReply.includes("browse") || lowerReply.includes("product") || lowerReply.includes("ایسل") || lowerReply.includes("پروڈکٹس")) {
        navSuggestions.push({ label: isUr ? "📦 کیٹلاگ کھولیں" : "📦 Go to Catalog", tab: "browse" });
      }
      if (lowerReply.includes("voice") || lowerReply.includes("scan") || lowerReply.includes("صوتی")) {
        navSuggestions.push({ label: isUr ? "🎙️ صوتی اسسٹنٹ کھولیں" : "🎙️ Voice Assistant", tab: "voice" });
      }
      if (lowerReply.includes("order") || lowerReply.includes("invoice") || lowerReply.includes("آرڈر")) {
        navSuggestions.push({ label: isUr ? "🧾 آرڈرز دیکھئیے" : "🧾 View Orders", tab: "orders" });
      }

      const botMsg = {
        id: "bot_" + Date.now(),
        sender: "bot",
        text: botReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        navSuggestions: navSuggestions.length > 0 ? navSuggestions : null
      };

      setMessages(prev => [...prev, botMsg]);
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error("Chatbot frontend error:", err);
      const dynamicText = generateDynamicClientResponse(query, lang, products);
      const fallbackMsg = {
        id: "bot_err_" + Date.now(),
        sender: "bot",
        text: dynamicText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm(isUr ? "کیا آپ چیٹ کی ہسٹری صاف کرنا چاہتے ہیں؟" : "Clear conversation history?")) {
      const reset = getInitialMessages();
      setMessages(reset);
      localStorage.removeItem("voxcart_chatbot_messages");
    }
  };

  // Simple Markdown-style formatter for bot message rendering
  const renderFormattedText = (content) => {
    if (!content) return null;

    // Split paragraphs
    const paragraphs = content.split("\n");

    return paragraphs.map((para, pIdx) => {
      if (!para.trim()) return <div key={pIdx} className="h-1.5" />;

      // Bullet points
      const isBullet = para.trim().startsWith("- ") || para.trim().startsWith("* ") || para.trim().startsWith("• ");
      const cleanPara = isBullet ? para.trim().substring(2) : para;

      // Bold text replacement (**text**)
      const parts = cleanPara.split(/(\*\*.*?\*\*)/g);

      const formattedInline = parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-purple-200">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={pIdx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-purple-400 font-bold text-xs shrink-0">•</span>
            <span className="text-xs text-slate-200 leading-relaxed">{formattedInline}</span>
          </div>
        );
      }

      return (
        <p key={pIdx} className="text-xs text-slate-200 leading-relaxed my-1">
          {formattedInline}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans select-none print:hidden">
      
      {/* 1. FLOATING CHAT WINDOW POPUP */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-4 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[82vh] bg-slate-900/95 backdrop-blur-2xl border border-purple-500/25 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-3xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
          dir={isUr ? "rtl" : "ltr"}
        >
          {/* HEADER */}
          <div className="bg-gradient-to-r from-purple-900/90 via-slate-900 to-indigo-900/90 p-3.5 px-4 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-white/20">
                  <Bot className="w-5 h-5 text-white animate-pulse" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" title="VoxBot Online" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    {isUr ? "والکس باٹ AI" : "VoxBot AI"}
                  </h3>
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-400/30 font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-pink-300" />
                    Assistant
                  </span>
                </div>
                <p className="text-[10px] text-white/50 font-medium flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  {isUr ? "آن لائن • والکس کارٹ ہیلپ" : "Online • VoxCart Shopping Guide"}
                </p>
              </div>
            </div>

            {/* HEADER ACTIONS */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowFaqDrawer(!showFaqDrawer)}
                title={isUr ? "سوالات کی فہرست دیکھیں" : "Browse FAQs & Categories"}
                className={`p-1.5 px-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition active:scale-95 ${
                  showFaqDrawer
                    ? "bg-purple-500 text-white shadow-lg"
                    : "bg-white/10 text-purple-200 hover:bg-white/20 border border-purple-400/20"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>FAQs</span>
              </button>

              <button
                onClick={handleClearHistory}
                title={isUr ? "چیٹ کلیئر کریں" : "Clear conversation"}
                className="p-1.5 rounded-xl text-white/40 hover:text-red-300 hover:bg-white/10 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title={isUr ? "بند کریں" : "Minimize chat"}
                className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>



          {/* FAQ OVERLAY DRAWER PANEL */}
          {showFaqDrawer ? (
            <div className="flex-1 p-3 bg-slate-950/95 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-purple-500/30 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {isUr ? "تمام سوالات و کیٹیگریز" : "Browse All FAQs & Categories"}
                  </h4>
                </div>
                <button
                  onClick={() => setShowFaqDrawer(false)}
                  className="text-xs text-purple-300 hover:text-white underline"
                >
                  {isUr ? "چیٹ پر واپس" : "Back to Chat"}
                </button>
              </div>

              {/* FAQ Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  placeholder={isUr ? "سوال یا فیچر سرچ کریں..." : "Search questions, categories, features..."}
                  className="w-full bg-slate-900 border border-white/15 focus:border-purple-400 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none"
                />
              </div>

              {/* FAQ Group Filters */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {["All", "Categories", "Features", "Orders", "Checkout", "Policies"].map((group) => (
                  <button
                    key={group}
                    onClick={() => setFaqSelectedGroup(group)}
                    className={`text-[10px] font-semibold rounded-lg px-2.5 py-1 whitespace-nowrap transition active:scale-95 ${
                      faqSelectedGroup === group
                        ? "bg-purple-600 text-white shadow"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>

              {/* Scrollable FAQ List */}
              <div className="space-y-1.5 max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/40 pr-1">
                {FAQ_PRESETS.filter(faq => {
                  const matchesGroup = faqSelectedGroup === "All" || faq.group === faqSelectedGroup;
                  const qTerm = faqSearchQuery.toLowerCase();
                  const matchesSearch = !qTerm || 
                    faq.labelEn.toLowerCase().includes(qTerm) || 
                    faq.labelUr.toLowerCase().includes(qTerm) || 
                    faq.queryEn.toLowerCase().includes(qTerm) || 
                    faq.queryUr.toLowerCase().includes(qTerm);
                  return matchesGroup && matchesSearch;
                }).map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => {
                      setShowFaqDrawer(false);
                      handleSendMessage(isUr ? faq.queryUr : faq.queryEn);
                    }}
                    className="w-full text-left p-2.5 bg-slate-900/90 hover:bg-purple-900/40 border border-white/10 hover:border-purple-400/40 rounded-xl transition group flex items-start justify-between gap-2"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base shrink-0">{faq.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-purple-200 group-hover:text-pink-300 transition">
                          {isUr ? faq.labelUr : faq.labelEn}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {isUr ? faq.queryUr : faq.queryEn}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 font-mono px-1.5 py-0.5 rounded shrink-0 self-center">
                      {faq.group}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div 
              ref={chatContainerRef}
              className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-purple-500/20"
            >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} animate-in fade-in duration-150`}
              >
                <div className={`flex gap-2 max-w-[88%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  
                  {/* Bot Avatar Icon */}
                  {msg.sender === "bot" && (
                    <div className="w-7 h-7 rounded-xl bg-purple-900/60 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-3.5 h-3.5 text-purple-300" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div 
                    className={`rounded-2xl p-3 text-xs leading-relaxed shadow-lg ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none border border-purple-400/30"
                        : "bg-slate-800/90 border border-white/10 text-slate-100 rounded-tl-none"
                    }`}
                  >
                    {msg.sender === "bot" ? renderFormattedText(msg.text) : msg.text}

                    {/* Quick Suggestions underneath Welcome/Bot message */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col gap-1.5">
                        <p className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-pink-400" />
                          {isUr ? "تجویز کردہ سوالات:" : "Quick Questions:"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(sug.text)}
                              className="text-[11px] bg-purple-500/10 hover:bg-purple-500/25 border border-purple-400/20 text-purple-200 rounded-xl px-2.5 py-1 text-left transition active:scale-95 flex items-center gap-1"
                            >
                              <span>{sug.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Navigation Shortcut Buttons */}
                    {msg.navSuggestions && msg.navSuggestions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                        {msg.navSuggestions.map((nav, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (onNavigate) onNavigate(nav.tab);
                              setIsOpen(false);
                            }}
                            className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 font-semibold rounded-lg px-2 py-1 flex items-center gap-1 transition active:scale-95"
                          >
                            <span>{nav.label}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <span className="text-[9px] text-white/30 font-mono mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs animate-in fade-in">
                <div className="w-7 h-7 rounded-xl bg-purple-900/60 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-purple-300 animate-spin" />
                </div>
                <div className="bg-slate-800/90 border border-white/10 rounded-2xl rounded-tl-none p-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
          )}

          {/* INPUT FOOTER FORM */}
          <div className="p-3 bg-slate-950/90 border-t border-white/10 shrink-0">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isUr ? "والکس باٹ سے سوال پوچھیں..." : "Ask VoxBot about products, orders, policies..."}
                disabled={isTyping}
                className="flex-1 bg-white/5 border border-white/15 focus:border-purple-400 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 disabled:hover:from-purple-600 text-white p-2.5 rounded-2xl shadow-lg transition active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[9px] text-white/30 font-medium px-1">
              <span>VoxCart Trained AI Guide</span>
              <span className="text-purple-400/70 font-mono">24/7 Live Support</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. CUTE FLOATING WIDGET BUTTON TRIGGER */}
      <div className="relative flex items-center justify-end">
        
        {/* Floating Teaser Teaser Badge when closed */}
        {!isOpen && showTeaser && (
          <div 
            onClick={() => setIsOpen(true)}
            className="absolute right-16 bottom-1 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 text-white rounded-2xl p-2.5 px-3.5 shadow-xl text-xs font-medium cursor-pointer whitespace-nowrap animate-bounce hover:scale-105 transition flex items-center gap-2 group"
          >
            <span className="text-base">🤖</span>
            <div>
              <p className="text-xs font-bold text-purple-200">
                {isUr ? "کوئی سوال ہے؟" : "Have a question?"}
              </p>
              <p className="text-[10px] text-white/60">
                {isUr ? "VoxBot AI سے پوچھیں!" : "Ask VoxBot AI!"}
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowTeaser(false);
              }}
              className="text-white/40 hover:text-white ml-1 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Main Floating Circle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open VoxBot AI Chatbot"
          className={`relative group w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-[0_10px_25px_rgba(147,51,234,0.5)] hover:shadow-[0_15px_35px_rgba(147,51,234,0.7)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/20 ${
            isOpen ? "rotate-90 bg-slate-800" : ""
          }`}
        >
          {/* Pulsing ring background glow */}
          <span className="absolute inset-0 rounded-full bg-purple-500/40 animate-ping pointer-events-none opacity-75" />

          {/* Unread dot */}
          {hasUnread && !isOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-[9px] font-bold text-white z-10 animate-pulse">
              1
            </span>
          )}

          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Bot className="w-7 h-7 text-white group-hover:rotate-12 transition duration-200" />
              <Sparkles className="w-3.5 h-3.5 text-pink-300 absolute -top-1 -right-1.5 animate-pulse" />
            </div>
          )}
        </button>
      </div>

    </div>
  );
}
