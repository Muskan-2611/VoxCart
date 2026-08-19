// Product Fuzzy Matcher for VoxCart
// Provides accurate product database matching across voice, OCR, chat, and search.

const synonymsMap = {
  "coke": ["coca-cola", "cocacola", "cola", "soda"],
  "cola": ["coca-cola", "cocacola", "coke"],
  "milk": ["whole milk", "dairy milk", "pack milk", "milkpak", "full cream milk", "milk"],
  "egg": ["large eggs", "eggs", "egg", "ande", "anday"],
  "eggs": ["large eggs", "eggs", "egg", "ande", "anday"],
  "cheese": ["cheddar cheese", "cheese slice", "paneer", "cheese"],
  "butter": ["butter block", "butter", "makkhan", "makhan"],
  "bananas": ["bananas", "banana", "kela", "kelay"],
  "banana": ["bananas", "banana", "kela", "kelay"],
  "apples": ["apples", "apple", "seb", "saib"],
  "apple": ["apples", "apple", "seb", "saib"],
  "oranges": ["oranges", "orange", "kinnow", "kino", "malta"],
  "orange": ["oranges", "orange", "kinnow", "kino", "malta"],
  "mangoes": ["mangoes", "mango", "aam"],
  "mango": ["mangoes", "mango", "aam"],
  "tomatoes": ["tomatoes", "tomato", "tamatar", "tamatr"],
  "tomato": ["tomatoes", "tomato", "tamatar", "tamatr"],
  "potatoes": ["potatoes", "potato", "aloo", "aalu"],
  "potato": ["potatoes", "potato", "aloo", "aalu"],
  "onions": ["onions", "onion", "pyaaz", "piyaz", "pyaz"],
  "onion": ["onions", "onion", "pyaaz", "piyaz", "pyaz"],
  "carrots": ["carrots", "carrot", "gajar"],
  "carrot": ["carrots", "carrot", "gajar"],
  "chicken": ["chicken breast", "chicken", "murgi", "murghi", "chkn", "chk"],
  "beef": ["ground beef", "beef", "mincemeat", "qeema", "keema"],
  "qeema": ["ground beef", "beef", "mincemeat", "qeema", "keema"],
  "fish": ["salmon fillet", "fish fillet", "salmon", "machli"],
  "salmon": ["salmon fillet", "fish fillet", "salmon"],
  "water": ["mineral water", "water bottle", "paani", "pani"],
  "tea": ["green tea", "chai", "tea pack", "black tea", "lipton"],
  "chai": ["green tea", "chai", "tea pack", "black tea"],
  "rice": ["white rice", "basmati rice", "rice pack", "chawal"],
  "pasta": ["pasta", "macaroni", "spaghetti"],
  "oil": ["cooking oil", "oil bottle", "ghee", "tel", "tail"],
  "sugar": ["sugar", "cheeni", "chini"],
  "salt": ["salt", "namak"]
};

const romanUrduMap = {
  "doodh": "milk", "dudh": "milk", "khalees doodh": "milk", "dood": "milk", "mlk": "milk", "mk": "milk",
  "anday": "eggs", "ande": "eggs", "anda": "eggs", "andey": "eggs", "egs": "eggs", "egss": "eggs",
  "paneer": "cheese", "paner": "cheese", "chees": "cheese",
  "makkhan": "butter", "makhan": "butter", "makkan": "butter", "btr": "butter",
  "kelay": "bananas", "kele": "bananas", "kela": "bananas",
  "saib": "apples", "seb": "apples", "apple": "apples",
  "maltey": "oranges", "malte": "oranges", "malta": "oranges", "kinnow": "oranges", "kino": "oranges",
  "aam": "mangoes", "mango": "mangoes",
  "tamatar": "tomatoes", "tomato": "tomatoes", "tamatr": "tomatoes", "tmt": "tomatoes", "tom": "tomatoes",
  "aaloo": "potatoes", "aalu": "potatoes", "aloo": "potatoes", "alu": "potatoes", "potato": "potatoes", "pot": "potatoes",
  "pyaaz": "onions", "piyaz": "onions", "pyaz": "onions", "onion": "onions", "oni": "onions",
  "gajar": "carrots", "gajjar": "carrots", "carrot": "carrots",
  "murghi": "chicken", "murgi": "chicken", "murghi ka gosht": "chicken", "chicken": "chicken", "chkn": "chicken", "chk": "chicken", "chiken": "chicken",
  "qeema": "beef", "qima": "beef", "keema": "beef", "beef": "beef",
  "machli": "fish", "machhli": "fish", "fish": "fish", "salmon": "fish",
  "paani": "water", "pani": "water", "water": "water", "wtr": "water",
  "chai": "tea", "sabz chai": "tea", "tea": "tea",
  "chawal": "rice", "rice": "rice",
  "tel": "oil", "tail": "oil", "koking oil": "oil", "cooking oil": "oil", "oil": "oil", "ghee": "oil",
  "cheeni": "sugar", "chini": "sugar", "sugar": "sugar", "sgr": "sugar",
  "namak": "salt", "salt": "salt", "slt": "salt"
};

const noiseWordsRegex = /\b(1x|2x|3x|4x|5x|kg|g|gram|grams|kilo|kilos|kilogram|kilograms|liter|liters|litre|litres|l|ml|milliliter|milliliters|lb|lbs|pound|pounds|pack|packs|packet|packets|box|boxes|bottle|bottles|piece|pieces|pcs|pc|dozen|dozens|pkr|rs|usd|\$|nestle|olpers|national|shan|shangrila|habib|lipton|tapal|meezan|dalda|rafhan|knorr|knor|mitchells|sensodyne|colgate|lux|surf|ariel|harpic|dettol|fresh|super|kernel|broiler|pure|life|iodized|organic|org|original|best|quality|premium|extra|prime|brand|select|choice|item|items)\b/gi;

function normalizeStr(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanNoise(str) {
  const norm = normalizeStr(str);
  return norm
    .replace(noiseWordsRegex, "")
    .replace(/\b\d+(\.\d+)?(kg|g|l|ml|oz|lb)?\b/gi, "")
    .replace(/\b\d+\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripPlural(s) {
  return (s || "")
    .replace(/s\b|es\b|ies\b/gi, "")
    .replace(/es$/gi, "")
    .replace(/s$/gi, "");
}

function levenshtein(a, b) {
  if (!a) return b ? b.length : 0;
  if (!b) return a ? a.length : 0;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function getSpellingSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  const dist = levenshtein(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return maxLen === 0 ? 1 : 1 - dist / maxLen;
}

export function matchProductFuzzy(pNameItem, pNameUrItem, productsList) {
  if (!productsList || productsList.length === 0) return null;

  const rawEn = normalizeStr(pNameItem);
  const rawUr = normalizeStr(pNameUrItem);

  if (!rawEn && !rawUr) return null;

  const cleanedEn = cleanNoise(rawEn) || rawEn;

  // 1. Check direct ID / Exact name matches first
  for (const p of productsList) {
    const pName = normalizeStr(p.name);
    const pNameUr = normalizeStr(p.nameUr);
    if (pName === rawEn || (pNameUr && rawUr && pNameUr === rawUr)) {
      return p;
    }
    if (pName === cleanedEn) {
      return p;
    }
  }

  // Translate Roman Urdu tokens or abbreviations
  let expandedEn = cleanedEn
    .split(" ")
    .map(tok => romanUrduMap[tok] || tok)
    .join(" ");

  // Evaluate candidate products and score them
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
    const pName = normalizeStr(p.name);
    const pNameUr = normalizeStr(p.nameUr);
    const pNameCleaned = cleanNoise(pName) || pName;

    let score = 0;

    // A. Cleaned Exact Match
    if (pNameCleaned === cleanedEn || pNameCleaned === expandedEn) {
      score = Math.max(score, 98);
    }

    // B. Synonym Match
    if (synonymsMap[cleanedEn] || synonymsMap[expandedEn]) {
      const synList = synonymsMap[cleanedEn] || synonymsMap[expandedEn] || [];
      if (synList.some(syn => pName.includes(syn) || pNameCleaned.includes(syn))) {
        score = Math.max(score, 92);
      }
    }

    // C. Substring Match
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

    // D. Token Overlap Score
    const tokensScanned = expandedEn.split(" ").filter(t => t.length > 1);
    const tokensProduct = pNameCleaned.split(" ").filter(t => t.length > 1);

    if (tokensScanned.length > 0 && tokensProduct.length > 0) {
      let matches = 0;
      for (const st of tokensScanned) {
        const stSingular = stripPlural(st);
        for (const pt of tokensProduct) {
          const ptSingular = stripPlural(pt);
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

    // E. Key Noun Matching
    for (const noun of keyNounList) {
      const nounSingular = stripPlural(noun);
      const isScannedHasNoun = expandedEn.includes(noun) || expandedEn.includes(nounSingular);
      const isProductHasNoun = pName.includes(noun) || pName.includes(nounSingular) || pNameCleaned.includes(noun);
      if (isScannedHasNoun && isProductHasNoun) {
        score = Math.max(score, 70);
      }
    }

    // F. Fuzzy Levenshtein Distance Match
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

  // Only return match if confidence score is >= 45.
  // Otherwise, return null so it is correctly flagged as Unmatched / Unavailable!
  if (maxScore >= 45 && bestProduct) {
    return bestProduct;
  }

  return null;
}

export function cleanOcrArtifacts(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/[|│┃]/g, " ")
    .replace(/[~`^]/g, "")
    .replace(/_{2,}/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\b1L\b|\b1 L\b/gi, "1L")
    .replace(/\b1kg\b|\b1 kg\b/gi, "1kg")
    .replace(/\b2kg\b|\b2 kg\b/gi, "2kg")
    .replace(/\b5kg\b|\b5 kg\b/gi, "5kg")
    .trim();
}

export function parseOcrTextToItemsClient(ocrText, productsList = []) {
  if (!ocrText || typeof ocrText !== "string") return [];
  const cleanedText = cleanOcrArtifacts(ocrText);

  const rawLines = cleanedText
    .split(/\r?\n|(?<=[a-zA-Z0-9\)\u0600-\u06FF])\s+(?=\d+[\.\)\-]\s*)/)
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

  const extractedItems = [];
  const seenKeys = new Set();

  for (let originalLine of rawLines) {
    let line = originalLine.trim();
    if (line.length < 2) continue;
    const lower = line.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();

    if (/^[\-\*\=\.\:\,\>\#\(\)\|\+\/_]+$/.test(line)) continue;
    if (/^(\-{3,}|={3,}|\*{3,})$/.test(line)) continue;
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

    line = line.replace(/^\s*(?:\d+[\.\)\-]|[\-\*•\>\✓\✔\xbb])\s*/, "").trim();

    const leadingNumMatch = line.match(/^\s*(\d{1,3})\s*(?:x|\*|@|pcs|pc|packs|pkt|doz|dozen)?\s+([a-zA-Z\u0600-\u06FF].*)/i);
    if (leadingNumMatch) {
      const q = parseInt(leadingNumMatch[1], 10);
      if (q > 0 && q <= 100) {
        qty = q;
        line = leadingNumMatch[2].trim();
      }
    }

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
    const key = cleanName.toLowerCase();
    if (seenKeys.has(key)) continue;

    const match = matchProductFuzzy(cleanName, cleanName, productsList);

    if (match) {
      const isInactiveOrUnavailable = match.status === "Inactive" || match.status?.toLowerCase() === "inactive" || match.status === "Unavailable" || match.status?.toLowerCase() === "unavailable";
      const isOutOfStock = typeof match.stockQuantity === "number" && match.stockQuantity <= 0;
      const isAvailable = !isInactiveOrUnavailable && !isOutOfStock;
      const activePrice = (match.salePrice && match.salePrice > 0) ? match.salePrice : (match.price || 150);
      extractedItems.push({
        name: match.name,
        nameUr: match.nameUr || cleanName,
        category: match.category || "Grocery",
        price: price > 0 ? price : (activePrice > 0 ? activePrice : 150),
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
      seenKeys.add(String(match.id));
      seenKeys.add(match.name.toLowerCase().trim());
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
    seenKeys.add(key);
  }

  // Full-text catalog keyword matching fallback
  const lowerOcr = cleanedText.toLowerCase();
  for (const p of productsList) {
    const pNameLower = (p.name || "").toLowerCase().trim();
    const pUrLower = (p.nameUr || "").toLowerCase().trim();
    if (seenKeys.has(String(p.id)) || seenKeys.has(pNameLower)) continue;
    if (pNameLower && (pNameLower.length >= 3 && lowerOcr.includes(pNameLower)) || (pUrLower.length >= 3 && lowerOcr.includes(pUrLower))) {
      const isInactiveOrUnavailable = p.status === "Inactive" || p.status?.toLowerCase() === "inactive" || p.status === "Unavailable" || p.status?.toLowerCase() === "unavailable";
      const isOutOfStock = typeof p.stockQuantity === "number" && p.stockQuantity <= 0;
      const isAvailable = !isInactiveOrUnavailable && !isOutOfStock;
      const activePrice = (p.salePrice && p.salePrice > 0) ? p.salePrice : (p.price || 150);
      extractedItems.push({
        name: p.name,
        nameUr: p.nameUr || p.name,
        category: p.category || "Grocery",
        price: activePrice > 0 ? activePrice : 150,
        qty: 1,
        unit: p.unit || "item",
        unitUr: p.unitUr || "عدد",
        productId: p.id,
        matched: isAvailable,
        isCatalogMatch: true,
        isAvailable: isAvailable,
        status: isAvailable ? "Available" : "Unavailable",
        currencyCode: p.currencyCode || p.currency || "PKR"
      });
      seenKeys.add(String(p.id));
      seenKeys.add(pNameLower);
    }
  }

  return extractedItems;
}

