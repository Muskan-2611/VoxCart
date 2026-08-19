import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  Bot, X, Send, Trash2, Sparkles, MessageSquare, ChevronRight, ChevronLeft,
  HelpCircle, ShoppingBag, Mic, Truck, CreditCard, ShieldCheck, 
  UserCheck, ExternalLink, Minimize2, RefreshCw, Zap, BookOpen, Tag, Search, ShoppingCart
} from "lucide-react";
import { api } from "../utils/api";
import { formatPrice } from "../utils/localizer";
import { parseVoiceCommand } from "../utils/voiceParser";
import { matchProductFuzzy } from "../utils/productMatcher";

function formatRecipeWithLiveAvailability(recipeKey, titleEn, titleUr, baseIngredients, isUr, products = [], fmt, currency = "USD") {
  const activeProds = Array.isArray(products) ? products.filter(p => p.status !== "Inactive") : [];
  let unavailableCount = 0;

  const ingredientLines = baseIngredients.map(ing => {
    // Look up ingredient fuzzy or by keyword
    const match = activeProds.find(p => {
      const pName = (p.name || "").toLowerCase();
      const pUr = (p.nameUr || "").toLowerCase();
      const ingName = (ing.name || "").toLowerCase();
      const ingNameUr = (ing.nameUr || "").toLowerCase();
      return (ingName && (pName.includes(ingName) || ingName.includes(pName))) ||
             (ingNameUr && (pUr.includes(ingNameUr) || ingNameUr.includes(pUr))) ||
             (ing.category && p.category && p.category.toLowerCase() === ing.category.toLowerCase());
    });

    const isAvailable = match && match.status !== "Inactive" && match.status !== "Unavailable" && (match.stockQuantity === undefined || match.stockQuantity > 0);

    if (!isAvailable) {
      unavailableCount++;
      return isUr
        ? `- ${ing.icon || "📦"} **${ing.nameUr || ing.name}** (${ing.qty || 1} ${ing.unitUr || ing.unit || "پیکٹ"}): ❌ **دستیاب نہیں (Unavailable)**`
        : `- ${ing.icon || "📦"} **${ing.name}** (${ing.qty || 1} ${ing.unit || "pack"}): ❌ **Unavailable**`;
    } else {
      const unitLabel = isUr ? (match.unitUr || ing.unitUr || match.unit || "پیکٹ") : (match.unit || ing.unit || "pack");
      const priceFormatted = fmt(match.price, match.currencyCode);
      const stockStr = isUr ? `اسٹاک: ${match.stockQuantity} دستیاب` : `In Stock: ${match.stockQuantity} available`;
      return isUr
        ? `- ${ing.icon || "📦"} **${match.nameUr || ing.nameUr || ing.name}**: ${ing.qty || 1} ${unitLabel} — ✅ **دستیاب** (${priceFormatted} | ${stockStr})`
        : `- ${ing.icon || "📦"} **${match.name}**: ${ing.qty || 1} ${unitLabel} — ✅ **In Stock** (${priceFormatted} | ${stockStr})`;
    }
  });

  const availabilitySummary = unavailableCount > 0
    ? (isUr 
        ? `\n⚠️ **اسٹاک الرٹ:** اس ترکیب کے **${unavailableCount}** اجزاء فی الوقت اسٹاک میں دستیاب نہیں ہیں اور واضح طور پر **"Unavailable"** دکھائے گئے ہیں۔`
        : `\n⚠️ **Stock Alert:** **${unavailableCount}** required ingredient(s) are currently out of stock and clearly marked as **"Unavailable"** above.`)
    : (isUr 
        ? `\n✅ **تمام اجزاء اسٹاک میں دستیاب ہیں!**` 
        : `\n✅ **All required ingredients are currently available in stock!**`);

  return isUr
    ? `🥘 **${titleUr} کی مکمل ریسپی اور درکار اجزاء:**\n\n${ingredientLines.join("\n")}${availabilitySummary}\n\n💡 **طریقہ:** **Catalog** ٹیب پر جائیں اور سرچ بار میں '${titleEn}' لکھیں تاکہ دستیاب اجزاء فوری طور پر ایک کلک میں کارٹ میں شامل کر سکیں!`
    : `🥘 **${titleEn} Recipe & Required Ingredients:**\n\n${ingredientLines.join("\n")}${availabilitySummary}\n\n💡 **Tip:** Go to the **Catalog** tab and search '${titleEn}' to view cooking directions and add all available ingredients to your cart in 1-click!`;
}

function generateDynamicClientResponse(query, lang, products = [], currency = "USD", chatHistory = []) {
  const q = (query || "").toLowerCase().trim();
  const isUr = lang === "ur" || /[\u0600-\u06FF]/.test(query) || q.includes("kya") || q.includes("hai") || q.includes("kaise") || q.includes("chahiye");

  const fmt = (price, fromCurr) => formatPrice(price, currency, lang, fromCurr);

  const formatClientProduct = (p, userAskedForSpecs = false) => {
    const unitLabel = isUr ? (p.unitUr || p.unit || "پیکٹ") : (p.unit || "unit");
    const isAvailable = p.status !== "Inactive" && p.status !== "Unavailable" && (p.stockQuantity === undefined || p.stockQuantity > 0);
    const stockStatus = isAvailable 
      ? (isUr ? `✅ اسٹاک میں موجود ہے (${p.stockQuantity} ${unitLabel} دستیاب)` : `✅ In Stock (${p.stockQuantity} ${unitLabel} available)`)
      : (isUr ? "❌ دستیاب نہیں (Unavailable) — 0 موجود" : "❌ Unavailable (0 available)");
    
    const saleInfo = (p.salePrice && p.salePrice > 0)
      ? (isUr ? `\n- 🏷️ **رعایتی قیمت (Sale Price):** ${fmt(p.salePrice, p.currencyCode)} (خصوصی رعایت)` : `\n- 🏷️ **Sale Price:** ${fmt(p.salePrice, p.currencyCode)} (Special Discount!)`)
      : "";

    const brandInfo = p.brandName || p.brand || (isUr ? "سٹور پروڈکٹ" : "VoxCart Selection");
    const subcatInfo = p.subcategoryName || p.subcategory || "";
    const desc = p.description || p.descriptionUr || (isUr ? "اعلیٰ معیار کی تازہ گروسری پروڈکٹ" : "Fresh, premium quality grocery product available at VoxCart.");

    let specsSection = "";
    if (userAskedForSpecs) {
      const skuInfo = p.sku || `SKU-${p.id}`;
      const batchInfo = p.batchNumber || `BATCH-${p.id}`;
      const mfgDate = p.manufacturingDate || "2026-01-15";
      const expiryDate = p.expiryDate || "2027-01-15";
      specsSection = isUr
        ? `\n\n📋 **تکنیکی تفصیلات (Specifications):**\n- **ایس کے یو (SKU):** \`${skuInfo}\`\n- **بیچ نمبر (Batch No):** \`${batchInfo}\`\n- **تیاری کی تاریخ (Mfg):** ${mfgDate}\n- **ایکسپائری تاریخ (Expiry):** ${expiryDate}\n- **یونٹ:** ${unitLabel}`
        : `\n\n📋 **Product Specifications:**\n- **SKU:** \`${skuInfo}\`\n- **Batch Number:** \`${batchInfo}\`\n- **Manufacturing Date:** ${mfgDate}\n- **Expiry Date:** ${expiryDate}\n- **Unit:** ${unitLabel}`;
    }

    return isUr
      ? `🛍️ **${p.nameUr || p.name} (${p.name})**\n\n` +
        `- 🏷️ **قیمت:** **${fmt(p.price, p.currencyCode)}** (${p.price} PKR) فی ${unitLabel}${saleInfo}\n` +
        `- 📦 **دستیابی (اسٹاک):** ${stockStatus}\n` +
        `- 📌 **کیٹیگری:** ${p.category} ${subcatInfo ? `> ${subcatInfo}` : ''}\n` +
        `- 🏢 **برانڈ:** ${brandInfo}\n` +
        `- 📝 **تفصیل:** ${desc}${specsSection}\n\n` +
        `💡 اس پروڈکٹ کو خریدنے کے لیے **Catalog** ٹیب پر جائیں یا مائیک دبا کر بولیں: *"Add ${p.name} to cart"*!`
      : `🛍️ **${p.name}** ${p.nameUr ? `*(${p.nameUr})*` : ''}\n\n` +
        `- 🏷️ **Price:** **${fmt(p.price, p.currencyCode)}** (${p.price} PKR) per ${unitLabel}${saleInfo}\n` +
        `- 📦 **Availability:** ${stockStatus}\n` +
        `- 📌 **Category:** ${p.category} ${subcatInfo ? `> ${subcatInfo}` : ''}\n` +
        `- 🏢 **Brand:** ${brandInfo}\n` +
        `- 📝 **Description:** ${desc}${specsSection}\n\n` +
        `💡 You can view and add this item to your cart in the **Catalog** tab, or tap the mic and say *"Add ${p.name} to cart"*!`;
  };

  // Follow-up context extraction from chat history
  const activeProds = Array.isArray(products) ? products.filter(p => p.status !== "Inactive") : [];
  let contextProduct = null;
  if (Array.isArray(chatHistory) && chatHistory.length > 0) {
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      const prevText = (chatHistory[i].text || "").toLowerCase();
      const found = activeProds.find(p => {
        const pName = (p.name || "").toLowerCase();
        return pName.length >= 3 && prevText.includes(pName);
      });
      if (found) {
        contextProduct = found;
        break;
      }
    }
  }

  const isExplicitSpecQuery = (
    q.includes("sku") || q.includes("batch") || q.includes("expiry") || q.includes("expire") ||
    q.includes("mfg") || q.includes("manufacturing") || q.includes("spec") || q.includes("specification") ||
    q.includes("ایکسپائری") || q.includes("بیچ") || q.includes("تاریخ")
  );

  // Check if query is a follow-up about the contextual product
  const isFollowUp = contextProduct && (
    q.includes("it") || q.includes("its") || q.includes("this") || q.includes("that") || q.includes("cost") ||
    q.includes("price") || q.includes("expiry") || q.includes("expire") || q.includes("stock") || q.includes("batch") ||
    q.includes("sku") || q.includes("available") || q.includes("اس") || q.includes("یہ") || q.includes("قیمت") || q.includes("ایکسپائری")
  ) && q.split(/\s+/).length <= 7;

  if (isFollowUp && contextProduct) {
    if (q.includes("expiry") || q.includes("expire") || q.includes("ایکسپائری")) {
      return isUr
        ? `📅 **${contextProduct.name} کی ایکسپائری تاریخ:** ${contextProduct.expiryDate || "2027-01-15"}\n(تیاری کی تاریخ: ${contextProduct.manufacturingDate || "2026-01-15"}, بیچ: ${contextProduct.batchNumber || "BATCH-" + contextProduct.id})`
        : `📅 **Expiry Date for ${contextProduct.name}:** ${contextProduct.expiryDate || "2027-01-15"}\n(Manufacturing Date: ${contextProduct.manufacturingDate || "2026-01-15"}, Batch: ${contextProduct.batchNumber || "BATCH-" + contextProduct.id})`;
    }
    if (q.includes("stock") || q.includes("available") || q.includes("اسٹاک") || q.includes("دستیاب")) {
      const isAvail = contextProduct.status !== "Inactive" && contextProduct.status !== "Unavailable" && (contextProduct.stockQuantity === undefined || contextProduct.stockQuantity > 0);
      const stockStr = isAvail
        ? (isUr ? `✅ اسٹاک میں موجود ہے (${contextProduct.stockQuantity} ${contextProduct.unitUr || contextProduct.unit || 'یونٹس'} دستیاب)` : `✅ In Stock (${contextProduct.stockQuantity} ${contextProduct.unit || 'units'} available)`)
        : (isUr ? `❌ دستیاب نہیں (Unavailable)` : `❌ Unavailable (Out of Stock)`);
      return `📦 **${contextProduct.name}:** ${stockStr}`;
    }
    if (q.includes("batch") || q.includes("بیچ") || q.includes("sku")) {
      return `📋 **${contextProduct.name} Specs:**\n- **SKU:** \`${contextProduct.sku || "SKU-" + contextProduct.id}\`\n- **Batch:** \`${contextProduct.batchNumber || "BATCH-" + contextProduct.id}\`\n- **Expiry:** ${contextProduct.expiryDate || "2027-01-15"}`;
    }
    return formatClientProduct(contextProduct, isExplicitSpecQuery);
  }

  // 1. Unrelated external trivia check (strictly non-store queries)
  const nonStoreTrivia = [
    "capital of france", "weather in london", "who is the president of", "write python script",
    "solve calculus", "who won world cup 1998", "solar system mass", "tell me a movie plot"
  ];
  if (nonStoreTrivia.some(k => q.includes(k))) {
    return isUr
      ? "میں والکس کارٹ کا **VoxBot AI** اسسٹنٹ ہوں۔ 🤖 میں اس ویب سائٹ کے تمام فیچرز، شاپنگ، ریسیپیز، پروڈکٹس، اور کسٹمر سپورٹ میں آپ کی مکمل رہنمائی کے لیے حاضر ہوں۔ آپ VoxCart سے متعلق کیا جاننا یا کرنا چاہتے ہیں؟"
      : "I am VoxBot, your VoxCart AI Shopping & Support Assistant! 🤖 I am trained to assist you with all store products, recipes, voice shopping, orders, feedback, and website navigation. How can I assist you with VoxCart today?";
  }

  // 2. PRODUCT TYPES & CLASSIFICATIONS OVERVIEW (Scrolling Types Support)
  if (q.includes("type") || q.includes("types") || q.includes("dietary") || q.includes("variety") || q.includes("اقسام") || q.includes("ورائٹی") || q.includes("ٹائپس")) {
    const categoriesSet = Array.from(new Set(activeProds.map(p => p.category).filter(Boolean)));
    const brandSet = Array.from(new Set(activeProds.map(p => p.brandName || p.brand).filter(Boolean)));
    
    return isUr
      ? `🏷️ **والکس کارٹ میں دستیاب تمام پروڈکٹ اقسام اور ورائٹیز (Product Types):**\n\n` +
        `• **بنیادی شعبہ جات (Category Types):** ${categoriesSet.join(", ")}\n` +
        `• **غذا اور کوالٹی کے اقسام (Dietary & Quality Types):** نامیاتی (Organic), حلال سرٹیفائیڈ (Halal), گلوٹن فری (Gluten-Free), تازہ فارم پروڈیوس (Fresh Produce), پریمیم ڈائری (Dairy Essentials), بیکری و سنیکس (Bakery & Snacks)\n` +
        `• **دستیاب برانڈز:** ${brandSet.slice(0, 8).join(", ")}\n\n` +
        `💡 آپ اوپر **FAQs** میں موجود **Types** فلٹر پر اسکرول کر کے تمام اقسام دیکھ سکتے ہیں یا **Catalog** میں مخصوص ٹائپ سرچ کریں!`
      : `🏷️ **Available Product Types & Classifications at VoxCart:**\n\n` +
        `• **Main Category Types:** ${categoriesSet.join(", ")}\n` +
        `• **Dietary & Specialty Types:** 100% Halal, Organic Produce, Gluten-Free Staples, Fresh Farm Dairy, Artisanal Bakery, Premium Frozen & Pantry\n` +
        `• **Top Brands:** ${brandSet.slice(0, 8).join(", ")}\n\n` +
        `💡 You can scroll through all available types in the **FAQs** menu under the **Types** filter or browse the **Catalog** tab!`;
  }

  // 3. CUSTOMER FEEDBACK, REVIEWS & COMPLAINTS FEATURE
  if (q.includes("feedback") || q.includes("review") || q.includes("rating") || q.includes("complaint") || q.includes("comment") || q.includes("رائے") || q.includes("فیڈبیک") || q.includes("شکایت") || q.includes("ریویو")) {
    return isUr
      ? "💬 **کسٹمر فیڈبیک اور ریویو فیچر کی مکمل تفصیلات (Customer Feedback & Reviews):**\n\n" +
        "1. **فیڈبیک درج کرنا:** نیویگیشن بار میں **Customer Feedback** ٹیب پر کلک کریں۔\n" +
        "2. **تفصیلات:** اپنا نام، ای میل، ستارہ ریٹنگ (1 سے 5 ستارے)، متعلقہ کیٹیگری (Service, Quality, Delivery, Website, Pricing, Other)، اور تفصیلی پیغام یا شکایت لکھیں۔\n" +
        "3. **ارسال اور ریکارڈ:** **'Submit Feedback'** پر کلک کریں؛ آپ کا ریویو فوری طور پر محفوظ ہو جائے گا۔\n" +
        "4. **ایڈمن جوابات اور حل:** اسی فیڈبیک پیج پر آپ شائع شدہ ریویوز اور ان پر ایڈمن ٹیم کے سرکاری جوابات اور اسٹیٹس (Resolved / In-Review) دیکھ سکتے ہیں!\n" +
        "5. **ایڈمن رسپانس پینل:** ایڈمن پینل سے اسٹور مینیجرز ہر کسٹمر فیڈبیک کا جائزہ لے کر سرکاری جواب جاری کر سکتے ہیں۔\n\n" +
        "💡 میں نے نیچے فیڈبیک پیج کا ڈائریکٹ بٹن شامل کر دیا ہے!"
      : "💬 **How the Customer Feedback & Reviews Feature Works:**\n\n" +
        "1. **Accessing Feedback:** Click on the **Customer Feedback** tab in the main navigation header.\n" +
        "2. **Submitting a Review:** Enter your Name, Email, Star Rating (1 to 5 Stars), Category (Customer Service, Product Quality, Delivery, Website, Pricing, Other), and your comments or complaints.\n" +
        "3. **Instant Recording:** Click **'Submit Feedback'** to submit your feedback to our support database.\n" +
        "4. **Admin Responses & Status:** All published customer reviews are visible on the Feedback page along with verified official admin responses and resolution badges (e.g., *Resolved*, *In Progress*)!\n" +
        "5. **Admin Management:** Store administrators can view, filter, and reply directly to customer feedback from the Admin Console.\n\n" +
        "💡 Click the quick button below to open Customer Feedback directly!";
  }

  // 4. DYNAMIC INVENTORY & CATEGORY OVERVIEW
  const isAllCatQuery = q.includes("all categories") || q.includes("show categories") || q.includes("list categories") || q.includes("categories list") || q.includes("what categories") || q.includes("all products") || q.includes("list all") || q.includes("show all products") || q.includes("list products") || q.includes("inventory list") || q.includes("all items") || q.includes("شعبے") || q.includes("تمام کیٹیگریز") || q.includes("تمام پروڈکٹس");

  if (isAllCatQuery && activeProds.length > 0) {
    const categoriesSet = Array.from(new Set(activeProds.map(p => p.category).filter(Boolean)));
    let categoryBreakdown = "";
    categoriesSet.forEach(cat => {
      const catItems = activeProds.filter(p => p.category === cat);
      if (catItems.length > 0) {
        const itemLines = catItems.map(p => {
          const isAvail = p.status !== "Inactive" && p.status !== "Unavailable" && (p.stockQuantity === undefined || p.stockQuantity > 0);
          const stockTag = isAvail ? "" : (isUr ? " — ❌ (Unavailable)" : " — ❌ (Unavailable)");
          return `  • **${p.name}** ${p.nameUr ? `(${p.nameUr})` : ''}: **${fmt(p.price, p.currencyCode)}** per ${isUr ? (p.unitUr || 'پیکٹ') : (p.unit || 'pack')}${stockTag}`;
        }).join("\n");
        categoryBreakdown += `\n📌 **${cat}** (${catItems.length} ${isUr ? 'اشیائے خوردونوش' : 'items'}):\n${itemLines}\n`;
      }
    });

    return isUr
      ? `🏷️ **والکس کارٹ کی تمام کیٹیگریز اور موجودہ پروڈکٹس (مکمل فہرست):**\n${categoryBreakdown}\n💡 **کل پروڈکٹس:** ${activeProds.length} | آپ **Catalog** ٹیب سے کسی بھی وقت خرید سکتے ہیں!`
      : `🏷️ **VoxCart Store Inventory & Categories (Complete List):**\n${categoryBreakdown}\n💡 **Total Available Items:** ${activeProds.length} across ${categoriesSet.length} categories. Visit the **Catalog** tab to filter and add items to your cart!`;
  }

  // 4b. SPECIFIC CATEGORY QUERIES
  let targetCategory = null;
  if (q.includes("dairy") || q.includes("milk") || q.includes("cheese") || q.includes("egg") || q.includes("butter") || q.includes("دودھ") || q.includes("انڈے") || q.includes("پنیر") || q.includes("مکھن")) {
    targetCategory = "Dairy";
  } else if (q.includes("fruit") || q.includes("apple") || q.includes("banana") || q.includes("mango") || q.includes("orange") || q.includes("strawberry") || q.includes("پھل") || q.includes("سیب") || q.includes("کیلے") || q.includes("آم") || q.includes("مالٹے")) {
    targetCategory = "Fruits";
  } else if (q.includes("veg") || q.includes("vegetable") || q.includes("potato") || q.includes("tomato") || q.includes("onion") || q.includes("carrot") || q.includes("سبزی") || q.includes("آلو") || q.includes("ٹماٹر") || q.includes("پیاز") || q.includes("گاجر")) {
    targetCategory = "Vegetables";
  } else if (q.includes("meat") || q.includes("chicken") || q.includes("beef") || q.includes("fish") || q.includes("seafood") || q.includes("گوشت") || q.includes("مرغی") || q.includes("قیمہ") || q.includes("مچھلی")) {
    targetCategory = "Meat";
  } else if (q.includes("beverage") || q.includes("drink") || q.includes("coke") || q.includes("coca") || q.includes("water") || q.includes("tea") || q.includes("coffee") || q.includes("مشروبات") || q.includes("چائے") || q.includes("پانی") || q.includes("کولڈ ڈرنک")) {
    targetCategory = "Beverages";
  } else if (q.includes("pantry") || q.includes("staple") || q.includes("rice") || q.includes("oil") || q.includes("sugar") || q.includes("salt") || q.includes("spice") || q.includes("پنساری") || q.includes("چاول") || q.includes("آئل") || q.includes("مصالحے") || q.includes("چینی") || q.includes("نمک")) {
    targetCategory = "Pantry";
  } else {
    const matchedCat = activeProds.find(p => p.category && q.includes(p.category.toLowerCase()));
    if (matchedCat) targetCategory = matchedCat.category;
  }

  const isCategoryOverviewQuery = targetCategory && (
    q.includes("what") || q.includes("show") || q.includes("list") || q.includes("available") || q.includes("category") || q.includes("all") || q.includes("have") ||
    q.includes("کون") || q.includes("کیا") || q.includes("دیکھو") || q.includes("فہرست") || q.includes("ہیں")
  );

  if (targetCategory && isCategoryOverviewQuery) {
    const catItems = activeProds.filter(p => (p.category || "").toLowerCase().includes(targetCategory.toLowerCase()));
    if (catItems.length > 0) {
      const catList = catItems.map(p => {
        const isAvail = p.status !== "Inactive" && p.status !== "Unavailable" && (p.stockQuantity === undefined || p.stockQuantity > 0);
        const stockStr = isAvail ? (isUr ? `✅ دستیاب (${p.stockQuantity})` : `✅ In Stock (${p.stockQuantity})`) : (isUr ? '❌ دستیاب نہیں (Unavailable)' : '❌ Unavailable');
        return `• **${p.name}** ${p.nameUr ? `(${p.nameUr})` : ''}: **${fmt(p.price, p.currencyCode)}** / ${isUr ? (p.unitUr || 'پیکٹ') : (p.unit || 'pack')} — ${stockStr}`;
      }).join("\n");

      return isUr
        ? `🏷️ **${targetCategory} کیٹیگری کی تمام اشیاء اور دستیابی:**\n\n${catList}\n\n💡 آپ **Catalog** ٹیب میں '${targetCategory}' فلٹر منتخب کر کے یہ اشیاء کارٹ میں شامل کر سکتے ہیں!`
        : `🏷️ **${targetCategory} Category — Products & Live Availability:**\n\n${catList}\n\n💡 Visit the **Catalog** tab and select the **${targetCategory}** filter to purchase!`;
    }
  }

  // 5. RECIPES WITH LIVE INGREDIENT AVAILABILITY (Showing "Unavailable" if item out of stock)
  if (q.includes("biryani") || q.includes("بریانی")) {
    return formatRecipeWithLiveAvailability("Chicken Biryani", "چکن بریانی", [
      { name: "Chicken Breast", nameUr: "چکن بریسٹ", icon: "🍗", qty: 1, unit: "KG", unitUr: "کلو", category: "Meat" },
      { name: "White Rice", nameUr: "سفید چاول", icon: "🌾", qty: 1, unit: "KG", unitUr: "کلو", category: "Pantry" },
      { name: "Fresh Onions", nameUr: "تازہ پیاز", icon: "🧅", qty: 1, unit: "KG", unitUr: "کلو", category: "Vegetables" },
      { name: "Fresh Red Tomatoes", nameUr: "تازہ ٹماٹر", icon: "🍅", qty: 1, unit: "KG", unitUr: "کلو", category: "Vegetables" },
      { name: "Potatoes", nameUr: "آلو", icon: "🥔", qty: 1, unit: "KG", unitUr: "کلو", category: "Vegetables" },
      { name: "Cooking Oil", nameUr: "کوکنگ آئل", icon: "🛢️", qty: 1, unit: "Liter", unitUr: "لیٹر", category: "Pantry" },
      { name: "Iodized Table Salt", nameUr: "آیوڈین ملا نمک", icon: "🧂", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Pantry" },
      { name: "Natural Greek Yogurt", nameUr: "تازہ دہی", icon: "🥛", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Dairy" }
    ], isUr, activeProds, fmt, currency);
  }

  if (q.includes("karahi") || q.includes("کڑاہی")) {
    return formatRecipeWithLiveAvailability("Chicken Karahi", "چکن کڑاہی", [
      { name: "Chicken Breast", nameUr: "چکن بریسٹ", icon: "🍗", qty: 1, unit: "KG", unitUr: "کلو", category: "Meat" },
      { name: "Fresh Red Tomatoes", nameUr: "تازہ ٹماٹر", icon: "🍅", qty: 1, unit: "KG", unitUr: "کلو", category: "Vegetables" },
      { name: "Fresh Onions", nameUr: "تازہ پیاز", icon: "🧅", qty: 1, unit: "KG", unitUr: "کلو", category: "Vegetables" },
      { name: "Cooking Oil", nameUr: "کوکنگ آئل", icon: "🛢️", qty: 1, unit: "Liter", unitUr: "لیٹر", category: "Pantry" },
      { name: "Iodized Table Salt", nameUr: "نمک", icon: "🧂", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Pantry" },
      { name: "Natural Greek Yogurt", nameUr: "دہی", icon: "🥛", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Dairy" }
    ], isUr, activeProds, fmt, currency);
  }

  if (q.includes("nihari") || q.includes("نہاری")) {
    return formatRecipeWithLiveAvailability("Special Nihari", "خاص نہاری", [
      { name: "Ground Beef / Beef", nameUr: "گوشت / بیف", icon: "🥩", qty: 1, unit: "KG", unitUr: "کلو", category: "Meat" },
      { name: "Wheat Flour", nameUr: "گندم کا آٹا", icon: "🌾", qty: 1, unit: "KG", unitUr: "کلو", category: "Pantry" },
      { name: "Cooking Oil", nameUr: "کوکنگ آئل", icon: "🛢️", qty: 1, unit: "Liter", unitUr: "لیٹر", category: "Pantry" },
      { name: "Iodized Table Salt", nameUr: "نمک", icon: "🧂", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Pantry" }
    ], isUr, activeProds, fmt, currency);
  }

  if (q.includes("pasta") || q.includes("پاستا")) {
    return formatRecipeWithLiveAvailability("Creamy Chicken Pasta", "چکن پاستا", [
      { name: "Artisanal Pasta", nameUr: "پاستا پیکٹ", icon: "🍝", qty: 1, unit: "Box", unitUr: "ڈبہ", category: "Pantry" },
      { name: "Chicken Breast", nameUr: "چکن بریسٹ", icon: "🍗", qty: 1, unit: "KG", unitUr: "کلو", category: "Meat" },
      { name: "Whole Milk", nameUr: "خالص دودھ", icon: "🥛", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Dairy" },
      { name: "Farm Butter", nameUr: "مکھن", icon: "🧈", qty: 1, unit: "Block", unitUr: "بلاک", category: "Dairy" },
      { name: "Cheddar Cheese Block", nameUr: "چیدر چیز", icon: "🧀", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Dairy" }
    ], isUr, activeProds, fmt, currency);
  }

  if (q.includes("pizza") || q.includes("پیزا")) {
    return formatRecipeWithLiveAvailability("Homemade Pizza", "ہوم میڈ پیزا", [
      { name: "Artisanal Pizza Dough / Crust", nameUr: "پیزا کرسٹ", icon: "🍕", qty: 1, unit: "Base", unitUr: "عدد", category: "Bakery" },
      { name: "Cheddar Cheese Block", nameUr: "چیز", icon: "🧀", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Dairy" },
      { name: "Fresh Red Tomatoes", nameUr: "ٹماٹر / سوس", icon: "🍅", qty: 1, unit: "KG", unitUr: "کلو", category: "Vegetables" },
      { name: "Chicken Breast", nameUr: "چکن بریسٹ", icon: "🍗", qty: 1, unit: "KG", unitUr: "کلو", category: "Meat" }
    ], isUr, activeProds, fmt, currency);
  }

  if (q.includes("cake") || q.includes("کیک")) {
    return formatRecipeWithLiveAvailability("Chocolate Cake", "چاکلیٹ کیک", [
      { name: "Farm Fresh Eggs", nameUr: "تازہ انڈے", icon: "🥚", qty: 1, unit: "Dozen", unitUr: "درجن", category: "Dairy" },
      { name: "Whole Milk", nameUr: "خالص دودھ", icon: "🥛", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Dairy" },
      { name: "Farm Butter", nameUr: "مکھن", icon: "🧈", qty: 1, unit: "Block", unitUr: "بلاک", category: "Dairy" },
      { name: "Refined White Sugar", nameUr: "چینی", icon: "🍬", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Pantry" },
      { name: "Wheat Flour", nameUr: "گندم کا آٹا", icon: "🌾", qty: 1, unit: "KG", unitUr: "کلو", category: "Pantry" }
    ], isUr, activeProds, fmt, currency);
  }

  if (q.includes("burger") || q.includes("برگر")) {
    return formatRecipeWithLiveAvailability("Chicken Burger", "چکن برگر", [
      { name: "Burger Buns", nameUr: "برگر بنز", icon: "🍔", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Bakery" },
      { name: "Chicken Breast", nameUr: "چکن بریسٹ", icon: "🍗", qty: 1, unit: "KG", unitUr: "کلو", category: "Meat" },
      { name: "Cheddar Cheese Block", nameUr: "چیدر چیز", icon: "🧀", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Dairy" },
      { name: "Fresh Red Tomatoes", nameUr: "ٹماٹر", icon: "🍅", qty: 1, unit: "KG", unitUr: "کلو", category: "Vegetables" },
      { name: "Fresh Onions", nameUr: "پیاز", icon: "🧅", qty: 1, unit: "KG", unitUr: "کلو", category: "Vegetables" }
    ], isUr, activeProds, fmt, currency);
  }

  if (q.includes("kheer") || q.includes("کھیر")) {
    return formatRecipeWithLiveAvailability("Sweet Kheer", "لذیذ کھیر", [
      { name: "Whole Milk", nameUr: "خالص دودھ", icon: "🥛", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Dairy" },
      { name: "White Rice", nameUr: "سفید چاول", icon: "🌾", qty: 1, unit: "KG", unitUr: "کلو", category: "Pantry" },
      { name: "Refined White Sugar", nameUr: "چینی", icon: "🍬", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Pantry" },
      { name: "Farm Butter", nameUr: "مکھن", icon: "🧈", qty: 1, unit: "Block", unitUr: "بلاک", category: "Dairy" }
    ], isUr, activeProds, fmt, currency);
  }

  if (q.includes("chai") || q.includes("tea") || q.includes("چائے")) {
    return formatRecipeWithLiveAvailability("Special Chai / Tea", "کڑک چائے", [
      { name: "Whole Milk", nameUr: "خالص دودھ", icon: "🥛", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Dairy" },
      { name: "Organic Green Tea", nameUr: "چائے پتی", icon: "☕", qty: 1, unit: "Box", unitUr: "ڈبہ", category: "Beverages" },
      { name: "Refined White Sugar", nameUr: "چینی", icon: "🍬", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Pantry" }
    ], isUr, activeProds, fmt, currency);
  }

  if (q.includes("fried rice") || q.includes("فرائیڈ رائس")) {
    return formatRecipeWithLiveAvailability("Egg Fried Rice", "انڈہ فرائیڈ رائس", [
      { name: "Farm Fresh Eggs", nameUr: "تازہ انڈے", icon: "🥚", qty: 1, unit: "Dozen", unitUr: "درجن", category: "Dairy" },
      { name: "White Rice", nameUr: "سفید چاول", icon: "🌾", qty: 1, unit: "KG", unitUr: "کلو", category: "Pantry" },
      { name: "Cooking Oil", nameUr: "کوکنگ آئل", icon: "🛢️", qty: 1, unit: "Liter", unitUr: "لیٹر", category: "Pantry" },
      { name: "Fresh Onions", nameUr: "پیاز", icon: "🧅", qty: 1, unit: "KG", unitUr: "کلو", category: "Vegetables" },
      { name: "Iodized Table Salt", nameUr: "نمک", icon: "🧂", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Pantry" }
    ], isUr, activeProds, fmt, currency);
  }

  if (q.includes("omelette") || q.includes("omlet") || q.includes("آملیٹ")) {
    return formatRecipeWithLiveAvailability("Egg Omelette", "لذیذ آملیٹ", [
      { name: "Farm Fresh Eggs", nameUr: "تازہ انڈے", icon: "🥚", qty: 1, unit: "Dozen", unitUr: "درجن", category: "Dairy" },
      { name: "Fresh Onions", nameUr: "پیاز", icon: "🧅", qty: 1, unit: "KG", unitUr: "کلو", category: "Vegetables" },
      { name: "Fresh Red Tomatoes", nameUr: "ٹماٹر", icon: "🍅", qty: 1, unit: "KG", unitUr: "کلو", category: "Vegetables" },
      { name: "Cooking Oil", nameUr: "کوکنگ آئل", icon: "🛢️", qty: 1, unit: "Liter", unitUr: "لیٹر", category: "Pantry" },
      { name: "Iodized Table Salt", nameUr: "نمک", icon: "🧂", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Pantry" }
    ], isUr, activeProds, fmt, currency);
  }

  if (q.includes("pulao") || q.includes("پلاؤ") || q.includes("پلاو")) {
    return formatRecipeWithLiveAvailability("Chicken Pulao", "چکن پلاؤ", [
      { name: "Chicken Breast", nameUr: "چکن بریسٹ", icon: "🍗", qty: 1, unit: "KG", unitUr: "کلو", category: "Meat" },
      { name: "White Rice", nameUr: "سفید چاول", icon: "🌾", qty: 1, unit: "KG", unitUr: "کلو", category: "Pantry" },
      { name: "Fresh Onions", nameUr: "پیاز", icon: "🧅", qty: 1, unit: "KG", unitUr: "کلو", category: "Vegetables" },
      { name: "Cooking Oil", nameUr: "کوکنگ آئل", icon: "🛢️", qty: 1, unit: "Liter", unitUr: "لیٹر", category: "Pantry" },
      { name: "Iodized Table Salt", nameUr: "نمک", icon: "🧂", qty: 1, unit: "Pack", unitUr: "پیکٹ", category: "Pantry" }
    ], isUr, activeProds, fmt, currency);
  }

  if (q.includes("recipe") || q.includes("dish") || q.includes("ترکیب") || q.includes("ریسپی") || q.includes("ڈش")) {
    return isUr
      ? "🍝 **سمارٹ ریسپی سرچ اور اجزاء حاصل کرنے کا طریقہ (Smart Recipe Assistant):**\n\n" +
        "1. **Catalog** ٹیب پر جائیں۔\n" +
        "2. اوپر سرچ بار میں کسی بھی ڈش کا نام لکھیں (مثلاً: *Biryani, Karahi, Nihari, Pasta, Pizza, Cake, Burger, Kheer, Chai, Fried Rice, Omelette, Pulao*)۔\n" +
        "3. والکس کارٹ آپ کو ڈش بنانے کا طریقہ، درکار وقت، اور تمام اجزاء دکھائے گا۔\n" +
        "4. اگر کوئی جزو اسٹاک میں نہ ہو تو اسے واضح طور پر **'Unavailable'** دکھایا جاتا ہے۔\n" +
        "5. **'Add All Recipe Ingredients'** بٹن دبائیں تاکہ تمام دستیاب اجزاء فوری طور پر آپ کے کارٹ میں شامل ہو جائیں!"
      : "🍝 **How to Use Smart Recipe Search & Live Availability:**\n\n" +
        "1. Navigate to the **Catalog** tab.\n" +
        "2. In the search bar, type the name of any dish (e.g., *Biryani, Karahi, Nihari, Pasta, Pizza, Cake, Burger, Kheer, Chai, Fried Rice, Omelette, Pulao*).\n" +
        "3. VoxCart displays full step-by-step cooking directions and lists all required grocery ingredients.\n" +
        "4. If any required item is out of stock, it is clearly flagged as **'Unavailable'** instead of being ignored.\n" +
        "5. Click **'Add All Recipe Ingredients'** to put all in-stock items into your shopping cart in 1-click!";
  }

  // 6. WEBSITE ACTIONS & NAVIGATION TASKS
  if (q.includes("favourite") || q.includes("favorite") || q.includes("bookmark") || q.includes("heart") || q.includes("wishlist") || q.includes("save") || q.includes("پسندیدہ") || q.includes("فیورٹ")) {
    return isUr
      ? "❤️ **پسندیدہ اشیاء محفوظ کرنے کا طریقہ (Add to Favorites):**\n1. کسی بھی پروڈکٹ کارڈ کے اوپر دائیں کونے میں موجود **دل (❤️)** کے آئیکن پر کلک کریں۔\n2. وہ پروڈکٹ آپ کی پسندیدہ لسٹ میں محفوظ ہو جائے گی۔\n3. اوپر نیویگیشن بار میں **Saved Favourites** ٹیب کھول کر آپ تمام محفوظ شدہ اشیاء دیکھ سکتے ہیں اور ایک کلک میں کارٹ میں ڈال سکتے ہیں!"
      : "❤️ **How to Add Items to Favorites & Bookmarks:**\n1. Click the **Heart Icon (❤️)** on the top right of any product card in the Catalog or Home page.\n2. The item will be instantly saved to your personal wishlist.\n3. Navigate to the **Saved Favourites** tab in the main menu anytime to view all your bookmarked groceries and add them to your cart in 1-click!";
  }

  if (q.includes("voice") || q.includes("mic") || q.includes("speak") || q.includes("speech") || q.includes("صوتی") || q.includes("بول")) {
    return isUr
      ? "🎙️ **صوتی اسسٹنٹ کا طریقہ (Voice Shopping Assistant):**\n1. ہیڈر میں موجود مائیکروفون آئیکن یا **Voice Assistant** ٹیب پر کلک کریں۔\n2. مائیک آن کریں اور اردو، انگریزی یا رومن اردو میں بولیں (مثلاً: *'دو کلو آٹا اور ایک درجن انڈے شامل کرو'*)\n3. والکس کارٹ آپ کی آواز سمجھ کر فوری طور پر اشیاء کارٹ میں ڈال دے گا۔"
      : "🎙️ **How to Use Voice Assistant & Speech Shopping:**\n1. Click the microphone icon in the top header or navigate to the **Voice Assistant** tab.\n2. Tap the mic button and speak naturally in English, Urdu, or Roman Urdu (e.g., *'Add 2 kg flour and 1 dozen eggs'*).\n3. VoxCart recognizes product names and quantities to automatically populate your cart!";
  }

  if (q.includes("scan") || q.includes("ocr") || q.includes("receipt") || q.includes("bill") || q.includes("اسکین") || q.includes("رسید") || q.includes("تصویر")) {
    return isUr
      ? "📷 **بل اور شاپنگ لسٹ اسکینر (OCR Bill Scanner):**\n1. **Voice Assistant** ٹیب پر جائیں اور نیچے اسکرول کر کے **Invoice / Bill Scanner** دیکھیں۔\n2. اپنے کاغذی بل یا ہاتھ سے لکھی لسٹ کی تصویر اپ لوڈ کریں۔\n3. AI اسکینر تصویر پڑھ کر تمام آئٹمز کارٹ میں تبدیل کر دے گا!"
      : "📷 **How to Use the OCR Bill & Receipt Scanner:**\n1. Go to the **Voice Assistant** tab and scroll to the **Invoice / Bill Scanner** section.\n2. Upload a photo of a printed grocery bill or handwritten shopping list.\n3. Our AI vision scanner extracts the listed items and lets you add them directly to your cart!";
  }

  if (q.includes("order") || q.includes("track") || q.includes("status") || q.includes("invoice") || q.includes("history") || q.includes("آرڈر") || q.includes("رسید")) {
    return isUr
      ? "🧾 **آرڈر ٹریکنگ اور رسید دیکھنے کا طریقہ:**\n1. اوپر نیویگیشن بار میں **Orders** ٹیب پر کلک کریں۔\n2. وہاں آپ کو اپنے تمام آرڈرز کی لائیو ٹریکنگ (Pending ➔ Shipped ➔ Delivered) نظر آئے گی۔\n3. آپ کسی بھی آرڈر کا **'PDF Invoice'** ڈاؤن لوڈ یا پرنٹ بھی کر سکتے ہیں!"
      : "🧾 **How to Track Orders & Download Invoices:**\n1. Click on the **Orders** tab in the main navigation bar.\n2. View live status updates for all your purchases (Pending ➔ Shipped ➔ Delivered).\n3. Click the **PDF Invoice** button next to any order to view, download, or print official receipts!";
  }

  if (q.includes("checkout") || q.includes("place order") || q.includes("payment") || q.includes("pay") || q.includes("cod") || q.includes("card") || q.includes("easypaisa") || q.includes("jazzcash") || q.includes("چیک آؤٹ") || q.includes("ادائیگی")) {
    return isUr
      ? "💳 **چیک آؤٹ اور ادائیگی کے طریقے:**\n1. کارٹ کا جائزہ لینے کے بعد **'Proceed to Checkout'** پر کلک کریں۔\n2. اپنا ڈیلیوری ایڈریس درج کریں اور ادائیگی کا طریقہ منتخب کریں: Cash on Delivery (COD), Credit/Debit Card, EasyPaisa, JazzCash, یا Direct Bank Transfer۔\n3. **'Place Order'** پر کلک کریں!"
      : "💳 **How to Checkout & Payment Options:**\n1. Review your cart and click **'Proceed to Checkout'**.\n2. Enter your delivery address and select your preferred payment method: Cash on Delivery (COD), Credit/Debit Card, EasyPaisa, JazzCash, or Direct Bank Transfer.\n3. Click **'Place Order'** to complete your order!";
  }

  if (q.includes("deliver") || q.includes("shipping") || q.includes("fee") || q.includes("charge") || q.includes("دیلیوری") || q.includes("ڈلیوری")) {
    return isUr
      ? "🚚 **ڈیلیوری کی معلومات:**\n- **وقت:** آرڈرز 24-48 گھنٹوں میں پہنچائے جاتے ہیں۔\n- **مفت ڈیلیوری:** $10 یا PKR 2,000 سے زیادہ کے آرڈرز پر ڈیلیوری بالکل مفت ہے!\n- **ٹریکنگ:** **Orders** ٹیب سے آرڈر کی لائیو پوزیشن چیک کریں۔"
      : "🚚 **Delivery Information:**\n- **Delivery Time:** Orders arrive within 24-48 hours.\n- **Free Delivery:** All orders over $10 USD or PKR 2,000 qualify for 100% FREE shipping!\n- **Tracking:** Real-time updates are available on the **Orders** tab.";
  }

  if (q.includes("refund") || q.includes("return") || q.includes("policy") || q.includes("damaged") || q.includes("واپسی") || q.includes("ریفنڈ")) {
    return isUr
      ? "🔄 **ریفنڈ اور واپسی کی پالیسی:**\nتازہ گروسری اشیاء کے لیے 24 گھنٹوں کی واپسی کی پالیسی ہے۔ خرابی کی صورت میں رقم 3-5 دنوں میں واپس کر دی جاتی ہے۔"
      : "🔄 **Returns & Refund Policy:**\nVoxCart offers a 24-hour return policy for fresh grocery items. Full refunds are processed to your original payment method within 3-5 business days.";
  }

  if (q.includes("currency") || q.includes("pkr") || q.includes("usd") || q.includes("language") || q.includes("urdu") || q.includes("کرنسی") || q.includes("زبان")) {
    return isUr
      ? "🌐 **کرنسی اور زبان کا انتخاب:**\nہیڈر بار سے زبان (English / اردو) اور کرنسی (USD $, PKR ₨, EUR €, GBP £, SAR ﷼, AED) ایک کلک میں تبدیل کر سکتے ہیں۔"
      : "🌐 **Currency & Language Settings:**\nUse the top header to toggle between English and Urdu (اردو) or switch currencies across USD $, PKR ₨, EUR €, GBP £, SAR, and AED with live exchange rates!";
  }

  if (q.includes("account") || q.includes("login") || q.includes("register") || q.includes("admin") || q.includes("password") || q.includes("لاگ ان") || q.includes("اکاؤنٹ")) {
    return isUr
      ? "👤 **اکاؤنٹس اور ایڈمن پینل:**\n- گاہک لاگ ان کر کے یا گیسٹ موڈ میں خریداری کر سکتے ہیں۔ لاگ ان کرنے پر AI آپ کی ذاتی کیٹیگریز محفوظ رکھتا ہے۔\n- ایڈمن کنٹرول کے لیے **Admin** ٹیب پر جائیں (admin@voxcart.com / admin)"
      : "👤 **User Accounts & Admin Console:**\n- Customers can shop as Guest or create an Account to save delivery addresses and personal AI categories.\n- Store management is available in the **Admin** tab (default: `admin@voxcart.com` / `admin`).";
  }

  // 7. TARGETED PRODUCT LOOKUP (Clean & Exact Match)
  const ignoreWords = new Set([
    "what", "is", "are", "the", "a", "an", "price", "prices", "cost", "costs", "rate", "rates", "of", "how", "much", "many", "does", "do",
    "you", "have", "sell", "show", "me", "list", "available", "tell", "about", "for", "in", "store", "voxcart", "can",
    "buy", "give", "item", "product", "items", "products", "where", "to", "see", "view", "find", "track", "tracking",
    "order", "orders", "my", "your", "our", "history", "cart", "basket", "checkout", "pay", "payment", "account",
    "profile", "page", "tab", "go", "nav", "navigate", "help", "kya", "hai", "kaise", "chahiye", "کتنی", "کتنا",
    "قیمت", "کیا", "ہے", "بتاؤ", "سے", "پر", "روپے", "کتنے", "کون", "سی", "دکھاؤ", "معلومات", "تفصیل", "تفصیلات",
    "spec", "specs", "specification", "specifications", "feature", "features", "details", "info", "information"
  ]);

  const words = q.split(/[^a-zA-Z0-9\u0600-\u06FF]+/).filter(w => w.length >= 2 && !ignoreWords.has(w));

  let matchedProducts = [];

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

  if (matchedProducts.length === 1) {
    return formatClientProduct(matchedProducts[0], isExplicitSpecQuery);
  } else if (matchedProducts.length > 1) {
    const exactMatch = matchedProducts.find(p => (p.name || '').toLowerCase() === words.join(" ") || words.every(w => (p.name || '').toLowerCase().includes(w)));
    if (exactMatch) {
      return formatClientProduct(exactMatch, isExplicitSpecQuery);
    }
    const listStr = matchedProducts.slice(0, 5).map(p => {
      const unitLabel = isUr ? (p.unitUr || p.unit || 'پیکٹ') : (p.unit || 'pack');
      const isAvail = p.status !== "Inactive" && p.status !== "Unavailable" && (p.stockQuantity === undefined || p.stockQuantity > 0);
      const stockStr = isAvail
        ? (isUr ? `✅ اسٹاک میں موجود (${p.stockQuantity} دستیاب)` : `✅ In Stock (${p.stockQuantity} available)`)
        : (isUr ? "❌ دستیاب نہیں (Unavailable)" : "❌ Unavailable");
      return `• **${p.name}** ${p.nameUr ? `(${p.nameUr})` : ''}\n  └ 🏷️ **Price:** ${fmt(p.price, p.currencyCode)} (${p.price} PKR) / ${unitLabel} | 📌 **Category:** ${p.category} | ${stockStr}`;
    }).join("\n\n");

    return isUr
      ? `🔍 **آپ کی تلاش کے مطابق پروڈکٹس کی تفصیلات:**\n\n${listStr}\n\n💡 کسی مخصوص پروڈکٹ کی مزید معلومات جاننے کے لیے اس کا پورا نام لکھیں یا **Catalog** ٹیب دیکھیں!`
      : `🔍 **Matching Products Found:**\n\n${listStr}\n\n💡 Ask for a specific product name to view its complete profile, or visit the **Catalog** tab!`;
  }

  // General helpful website assistant answer
  return isUr
    ? `آپ کے سوال ("${query}") سے متعلق معلومات:\nوالکس کارٹ ایک دو لسانی صوتی آن لائن گروسری اسٹور ہے۔ آپ **Catalog** سے تمام پروڈکٹس، ورائٹیز اور ریسیپیز تلاش کر سکتے ہیں، **Voice Assistant** سے صوتی آرڈر دے سکتے ہیں، **Orders** سے ٹریکنگ دیکھ سکتے ہیں، یا **Customer Feedback** میں اپنی رائے درج کر سکتے ہیں۔ کسی بھی پروڈکٹ، فیچر یا ترکیب کا نام لکھیں تاکہ میں تفصیلی رہنمائی فراہم کر سکوں!`
    : `Regarding your question ("${query}"):\nVoxCart is a bilingual voice-activated online store. You can browse all product types and recipes in the **Catalog** tab, use hands-free shopping in the **Voice Assistant** tab, track orders in **Orders**, or share reviews in **Customer Feedback**! Feel free to ask about any product, feature, or website task.`;
}

const FAQ_PRESETS = [
  {
    id: "store_types",
    icon: "🏷️",
    group: "Types",
    labelEn: "All Product Types & Varieties",
    labelUr: "تمام اقسام و ورائٹیز",
    queryEn: "What product types, dietary varieties, and brand types are available?",
    queryUr: "سٹور میں کون کون سے پروڈکٹ اقسام، ڈائیٹری ورائٹیز اور برانڈز ہیں؟"
  },
  {
    id: "feedback_how",
    icon: "💬",
    group: "Feedback",
    labelEn: "Customer Feedback Feature",
    labelUr: "کسٹمر فیڈبیک فیچر",
    queryEn: "How does the Customer Feedback and review feature work?",
    queryUr: "کسٹمر فیڈبیک اور ریویو فیچر کیسے کام کرتا ہے؟"
  },
  {
    id: "recipe_search",
    icon: "🍲",
    group: "Recipes",
    labelEn: "Smart Recipe Search & Availability",
    labelUr: "سمارٹ ریسپی سرچ و دستیابی",
    queryEn: "How to search recipes and see required ingredient availability?",
    queryUr: "ریسیپیز کیسے تلاش کریں اور اجزاء کی دستیابی کیسے دیکھیں؟"
  },
  {
    id: "biryani_recipe",
    icon: "🥘",
    group: "Recipes",
    labelEn: "Chicken Biryani Recipe & Stock",
    labelUr: "چکن بریانی ریسپی و اسٹاک",
    queryEn: "Show me Chicken Biryani recipe and required ingredients stock",
    queryUr: "چکن بریانی کی ریسپی اور درکار اجزاء کا اسٹاک دکھائیں"
  },
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
    id: "voice",
    icon: "🎙️",
    group: "Features",
    labelEn: "Voice Shopping",
    labelUr: "صوتی اسسٹنٹ و زبان",
    queryEn: "How to use Voice Shopping and language toggle?",
    queryUr: "صوتی اسسٹنٹ اور زبان کا انتخاب کیسے کریں؟"
  },
  {
    id: "ocr",
    icon: "📷",
    group: "Features",
    labelEn: "Bill & Receipt Scanner",
    labelUr: "بل و رسید اسکینر",
    queryEn: "How to scan a grocery bill or handwritten list?",
    queryUr: "کاغذی بل یا ہاتھ سے لکھی لسٹ کیسے اسکین کریں؟"
  },
  {
    id: "track",
    icon: "🧾",
    group: "Orders",
    labelEn: "Track Order & PDF Invoice",
    labelUr: "آرڈر ٹریکنگ و بل",
    queryEn: "How to track orders and download PDF invoices?",
    queryUr: "آرڈر کیسے ٹریک کریں اور پی ڈی ایف بل حاصل کریں؟"
  },
  {
    id: "cart",
    icon: "🛒",
    group: "Shopping",
    labelEn: "Add to Cart & Buy",
    labelUr: "کارٹ اور خریداری",
    queryEn: "How do I add items to cart and place an order?",
    queryUr: "اشیاء کارٹ میں کیسے شامل کریں اور خریدیں؟"
  },
  {
    id: "payment",
    icon: "💳",
    group: "Checkout",
    labelEn: "Checkout & Payment Options",
    labelUr: "چیک آؤٹ و ادائیگی",
    queryEn: "What payment methods are supported at checkout?",
    queryUr: "ادائیگی اور چیک آؤٹ کے کون سے طریقے موجود ہیں؟"
  },
  {
    id: "delivery",
    icon: "🚚",
    group: "Policies",
    labelEn: "Delivery & Refund Policy",
    labelUr: "ڈیلیوری و ریفنڈ",
    queryEn: "What is the delivery time, shipping fee, and return policy?",
    queryUr: "ڈیلیوری کی فیس، وقت اور ریفنڈ پالیسی کیا ہے؟"
  },
  {
    id: "currency",
    icon: "🌐",
    group: "Settings",
    labelEn: "Currency & Language Switch",
    labelUr: "کرنسی و زبان",
    queryEn: "How to change currency or language on website?",
    queryUr: "ویب سائٹ کی زبان اور کرنسی کیسے تبدیل کریں؟"
  },
  {
    id: "account",
    icon: "👤",
    group: "Accounts",
    labelEn: "User & Admin Accounts",
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

  // Helper for user-scoped storage keys
  const getUserStorageKey = (u) => u ? `voxcart_chatbot_messages_${u.id || u.email}` : "voxcart_chatbot_messages_guest";

  // Initial welcome message (predefined questions removed from initial view, accessible in FAQs menu)
  const getInitialMessages = () => [
    {
      id: "msg_welcome",
      sender: "bot",
      text: isUr 
        ? "سلام! 👋 میں والکس کارٹ کا **VoxBot AI** اسسٹنٹ ہوں۔ میں آپ کو اسٹور کے تمام پروڈکٹس، صوتی شاپنگ، ریسیپیز، کسٹمر فیڈبیک، اور آرڈر ٹریکنگ سے متعلق سوالات کے درست جوابات فراہم کرتا ہوں۔ آپ اوپر موجود **FAQs** مینو سے تمام کیٹیگریز اور اکثر پوچھے گئے سوالات دیکھ سکتے ہیں یا اپنا سوال براہِ راست ٹائپ کریں!"
        : "Hi there! 👋 I'm **VoxBot**, your VoxCart AI Shopping Assistant. I'm fully website-aware and can accurately answer any questions about our products, live stock, recipes, customer feedback, voice shopping, policies, and order tracking. You can browse categorized questions in the **FAQs** menu above, or type any question directly!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  const sanitizeLoadedMessages = (msgs) => {
    if (!Array.isArray(msgs) || msgs.length === 0) return getInitialMessages();
    return msgs.map(m => {
      if (m.id === "msg_welcome") {
        const { suggestions, ...rest } = m;
        return rest;
      }
      return m;
    });
  };

  const [messages, setMessages] = useState(() => {
    try {
      const storageKey = getUserStorageKey(user);
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return sanitizeLoadedMessages(parsed);
      }
    } catch (e) {
      console.warn("Failed to parse chatbot history:", e);
    }
    return getInitialMessages();
  });

  // Re-sync messages whenever user logs in, logs out, or switches accounts
  useEffect(() => {
    const storageKey = getUserStorageKey(user);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(sanitizeLoadedMessages(parsed));
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to load user chatbot history:", e);
    }
    setMessages(getInitialMessages());
  }, [user?.id, user?.email]);

  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const faqScrollRef = useRef(null);
  const faqDrawerRef = useRef(null);

  // Ensure FAQ drawer opens and displays properly from the very top
  useEffect(() => {
    if (showFaqDrawer && faqDrawerRef.current) {
      faqDrawerRef.current.scrollTop = 0;
    }
  }, [showFaqDrawer, faqSelectedGroup, faqSearchQuery]);

  const scrollFaqToolbar = (direction) => {
    if (faqScrollRef.current) {
      const scrollAmount = direction === "left" ? -180 : 180;
      faqScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Save chat history locally for active user
  useEffect(() => {
    const storageKey = getUserStorageKey(user);
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-50)));
    } catch (e) {
      console.warn("Could not cache chatbot messages", e);
    }
  }, [messages, user?.id, user?.email]);

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

      // Send message directly to AI Chatbot endpoint / dynamic client generator
      let res = null;
      try {
        res = await api.sendChatMessage(query, chatHistory, lang, currency, activeTab, user ? user.id : null);
      } catch (e) {
        console.warn("Backend chatbot API unavailable or failed, generating dynamic answer client-side:", e);
      }
      
      if (res && res.reply) {
        botReplyText = res.reply;
      } else {
        botReplyText = generateDynamicClientResponse(query, lang, products, currency, messages);
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

      // Check if reply mentions specific tabs for quick action buttons
      const navSuggestions = [];
      const lowerReply = botReplyText.toLowerCase();
      if (lowerReply.includes("catalog") || lowerReply.includes("browse") || lowerReply.includes("product") || lowerReply.includes("ایسل") || lowerReply.includes("پروڈکٹس") || lowerReply.includes("recipe") || lowerReply.includes("بریانی")) {
        navSuggestions.push({ label: isUr ? "📦 کیٹلاگ کھولیں" : "📦 Go to Catalog", tab: "browse" });
      }
      if (lowerReply.includes("feedback") || lowerReply.includes("review") || lowerReply.includes("complaint") || lowerReply.includes("رائے") || lowerReply.includes("فیڈبیک")) {
        navSuggestions.push({ label: isUr ? "💬 فیڈبیک پیج کھولیں" : "💬 Customer Feedback", tab: "feedback" });
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
      const dynamicText = generateDynamicClientResponse(query, lang, products, currency, messages);
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
      const storageKey = getUserStorageKey(user);
      localStorage.removeItem(storageKey);
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
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 border border-purple-400/40 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                  <Bot className="w-5 h-5 text-white" />
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
            <div 
              ref={faqDrawerRef}
              className="flex-1 p-3 bg-slate-950/95 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-purple-500/30 animate-in fade-in duration-150"
            >
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

              {/* FAQ Group & Types Filters with Horizontal Scrolling */}
              <div className="relative flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollFaqToolbar("left")}
                  aria-label="Scroll Types Left"
                  className="p-1 rounded-lg bg-slate-800 text-purple-300 hover:text-white hover:bg-slate-700 border border-white/10 shrink-0 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div 
                  ref={faqScrollRef}
                  className="flex-1 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-purple-500/30 scroll-smooth"
                >
                  {["All", "Types", "Categories", "Features", "Feedback", "Recipes", "Orders", "Shopping", "Checkout", "Policies", "Settings", "Accounts"].map((group) => (
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

                <button
                  type="button"
                  onClick={() => scrollFaqToolbar("right")}
                  aria-label="Scroll Types Right"
                  className="p-1 rounded-lg bg-slate-800 text-purple-300 hover:text-white hover:bg-slate-700 border border-white/10 shrink-0 transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scrollable FAQ List */}
              <div className="space-y-1.5 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/40 pr-1">
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
                    <div className="w-7 h-7 rounded-xl bg-purple-900/80 border border-purple-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
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
                <div className="w-7 h-7 rounded-xl bg-purple-900/80 border border-purple-500/40 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
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
            <div className="w-6 h-6 rounded-lg bg-purple-900/80 border border-purple-400/40 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-purple-300" />
            </div>
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
          className={`relative group w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-[0_10px_25px_rgba(147,51,234,0.5)] hover:shadow-[0_15px_35px_rgba(147,51,234,0.7)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/20 overflow-hidden ${
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
