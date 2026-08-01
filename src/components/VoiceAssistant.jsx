import React, { useState, useEffect, useRef } from "react";
import { TRANSLATIONS, formatPrice, convertPrice, EXCHANGE_RATES } from "../utils/localizer";
import { parseVoiceCommand } from "../utils/voiceParser";
import { 
  Mic, 
  MicOff, 
  AlertCircle, 
  Play, 
  Send, 
  ChevronRight, 
  CornerDownRight, 
  ThumbsUp, 
  Sparkles, 
  Volume2, 
  UploadCloud, 
  Trash2, 
  Plus, 
  Loader2, 
  Check, 
  FileText,
  RefreshCw
} from "lucide-react";
import { api } from "../utils/api";

const matchProductFuzzy = (pNameItem, pNameUrItem, productsList) => {
  if (!productsList || productsList.length === 0) return null;
  const scannedName = (pNameItem || "").toLowerCase().trim();
  const scannedNameUr = (pNameUrItem || "").toLowerCase().trim();

  const normalizeStr = (str) => {
    return str
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const normScanned = normalizeStr(scannedName);
  const normScannedUr = normalizeStr(scannedNameUr);

  if (!normScanned && !normScannedUr) return null;

  // Levenshtein helper
  const levenshtein = (a, b) => {
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
  };

  const getSpellingSimilarity = (s1, s2) => {
    if (!s1 || !s2) return 0;
    const dist = levenshtein(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);
    return maxLen === 0 ? 1 : 1 - dist / maxLen;
  };

  // Singular / Plural strip
  const stripPlural = (s) => {
    return s
      .replace(/s\b|es\b|ies\b/gi, "")
      .replace(/es$/gi, "")
      .replace(/s$/gi, "");
  };

  const cleanScanned = stripPlural(normScanned);

  // Synonyms Map
  const synonyms = {
    "coke": ["coca-cola", "cocacola", "cola", "soda"],
    "cola": ["coca-cola", "cocacola", "coke"],
    "milk": ["whole milk", "dairy milk", "pack milk"],
    "egg": ["large eggs", "eggs", "egg"],
    "eggs": ["large eggs", "eggs", "egg"],
    "cheese": ["cheddar cheese", "cheese slice"],
    "butter": ["butter block", "butter"],
    "beef": ["ground beef", "beef", "mincemeat", "qeema", "keema"],
    "qeema": ["ground beef", "beef", "mincemeat", "qeema", "keema"],
    "chicken": ["chicken breast", "chicken", "meat"],
    "fish": ["salmon fillet", "fish fillet", "salmon"],
    "salmon": ["salmon fillet", "fish fillet", "salmon"],
    "water": ["mineral water", "water bottle"],
    "tea": ["green tea", "chai", "tea pack"],
    "chai": ["green tea", "chai", "tea pack"],
    "rice": ["white rice", "rice pack", "chawal"],
    "oil": ["cooking oil", "oil bottle"]
  };

  // 1. EXACT MATCH on English or Urdu name
  let matched = productsList.find(p => {
    const pName = (p.name || "").toLowerCase().trim();
    const pNameUr = (p.nameUr || "").toLowerCase().trim();
    return pName === scannedName || (pNameUr && scannedNameUr && pNameUr === scannedNameUr);
  });
  if (matched) return matched;

  // 2. NORMALIZED EXACT MATCH
  matched = productsList.find(p => {
    const pName = normalizeStr(p.name || "").toLowerCase();
    const pNameUr = normalizeStr(p.nameUr || "").toLowerCase();
    return pName === normScanned || (pNameUr && normScannedUr && pNameUr === normScannedUr);
  });
  if (matched) return matched;

  // 3. SYNONYM OR MAPPING MATCH
  for (const [key, synList] of Object.entries(synonyms)) {
    if (normScanned === key || synList.includes(normScanned)) {
      const match = productsList.find(p => {
        const pName = (p.name || "").toLowerCase();
        return pName.includes(key) || synList.some(s => pName.includes(s));
      });
      if (match) return match;
    }
  }

  // 4. PLURAL/SINGULAR MATCH
  matched = productsList.find(p => {
    const pName = stripPlural(normalizeStr(p.name || "").toLowerCase());
    return pName === cleanScanned || pName.includes(cleanScanned) || cleanScanned.includes(pName);
  });
  if (matched) return matched;

  // 5. WORD OVERLAP / SUBSTRING MATCH (case-insensitive, length > 2)
  matched = productsList.find(p => {
    const pName = normalizeStr(p.name || "").toLowerCase();
    const pNameUr = normalizeStr(p.nameUr || "").toLowerCase();

    if (pName.length > 2 && (normScanned.includes(pName) || pName.includes(normScanned))) return true;
    if (pNameUr && normScannedUr) {
      if (pNameUr.length > 2 && (normScannedUr.includes(pNameUr) || pNameUr.includes(normScannedUr))) return true;
    }
    return false;
  });
  if (matched) return matched;

  // 6. TOKEN INTERSECTION MATCH (Brand & package size stripping fallback)
  const coreGroceryTokens = [
    "milk", "doodh", "egg", "eggs", "anda", "anday", "cheese", "paneer", "butter", "makkhan",
    "banana", "bananas", "kela", "keley", "apple", "apples", "saeb", "seb", "orange", "kinnow",
    "tomato", "tomatoes", "tamatar", "potato", "potatoes", "aaloo", "alo", "onion", "onions", "piaz",
    "chicken", "murghi", "beef", "qeema", "meat", "goshat", "fish", "machli", "salmon",
    "coke", "cola", "pepsi", "water", "paani", "tea", "chai", "coffee",
    "rice", "chawal", "pasta", "macaroni", "oil", "ghee", "sugar", "chini", "salt", "namak", "flour", "atta"
  ];

  const scannedTokens = normScanned.split(/\s+/).map(stripPlural);
  for (const p of productsList) {
    const pTokens = normalizeStr(p.name || "").toLowerCase().split(/\s+/).map(stripPlural);
    const pUrTokens = normalizeStr(p.nameUr || "").toLowerCase().split(/\s+/).map(stripPlural);
    
    const sharedToken = scannedTokens.find(tok => 
      tok.length > 2 && 
      coreGroceryTokens.includes(tok) && 
      (pTokens.includes(tok) || pUrTokens.includes(tok))
    );
    if (sharedToken) {
      return p;
    }
  }

  // 7. FUZZY SPELLING VARIATION MATCH (Levenshtein Distance Similarity > 0.65)
  let bestMatch = null;
  let highestSim = 0;
  for (const p of productsList) {
    const pName = normalizeStr(p.name || "").toLowerCase();
    const sim = getSpellingSimilarity(normScanned, pName);
    if (sim > highestSim) {
      highestSim = sim;
      bestMatch = p;
    }
  }
  if (highestSim >= 0.70) {
    return bestMatch;
  }

  return null;
};


const speakText = (text, language = "en") => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "ur" ? "ur-PK" : "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("Speech synthesis error:", e);
  }
};

export default function VoiceAssistant({
  lang,
  currency = "USD",
  onAddItems,
  onClearCart,
  onCheckout,
  addLog,
  logs,
  onNotify,
  onClearLogs,
  products = [],
  onRefreshProducts
}) {
  const t = TRANSLATIONS[lang];
  const isUr = lang === "ur";

  // Mode state: 'voice' | 'scanner'
  const [activeMode, setActiveMode] = useState("voice");

  // ================= VOICE ASSISTANT STATE =================
  const [isListening, setIsListening] = useState(false);
  const [supportSpeech, setSupportSpeech] = useState(true);
  const [speechLanguage, setSpeechLanguage] = useState(lang === "en" ? "en-US" : "ur-PK");
  const [transcriptText, setTranscriptText] = useState("");
  const [customText, setCustomText] = useState("");
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const manualInputRef = useRef(null);

  // Advanced Bulk Voice Session management
  const [completedTranscript, setCompletedTranscript] = useState("");
  const [voiceDraftList, setVoiceDraftList] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [recipeCard, setRecipeCard] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(false);


  const isSessionActiveRef = useRef(false);
  const shouldAutoRestartRef = useRef(false);
  const transcriptTextRef = useRef("");
  const completedTranscriptRef = useRef("");
  const isVoiceParsingRef = useRef(false);
  const productsRef = useRef(products);

  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  useEffect(() => {
    transcriptTextRef.current = transcriptText;
  }, [transcriptText]);

  useEffect(() => {
    completedTranscriptRef.current = completedTranscript;
  }, [completedTranscript]);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const parseAndSyncVoiceDraftRef = useRef(null);
  parseAndSyncVoiceDraftRef.current = (text) => {
    // Disabled continuous offline regex parsing to avoid partial-word cart conflicts.
    // Full spoken text is parsed reliably in a single operation using Gemini upon pause/stop.
  };

  const executeAIVoiceParseRef = useRef(null);

  const handleStartNewBulkEntry = () => {
    setTranscriptText("");
    setCompletedTranscript("");
    setVoiceDraftList([]);
    transcriptTextRef.current = "";
    completedTranscriptRef.current = "";
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    onNotify(lang === "ur" ? "نیا صوتی بلک اندراج شروع ہو گیا!" : "Started a new bulk voice entry list!", "success");
    
    setIsSessionActive(true);
    isSessionActiveRef.current = true;
    shouldAutoRestartRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.lang = speechLanguage;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        // Safe bypass if already recording
      }
    }
  };

  const handleAddVoiceItemsToCart = () => {
    if (voiceDraftList.length === 0) return;

    const resolvedItems = voiceDraftList
      .filter(item => item.matched && item.productId)
      .map(item => ({
        productId: item.productId,
        qty: item.qty,
        action: "add"
      }));

    if (resolvedItems.length > 0) {
      onAddItems(resolvedItems);
      onNotify(isUr ? "اشیاء کامیابی سے کارٹ میں شامل کر دی گئیں۔" : "Successfully added items to your cart!", "success");
      addLog(`Voice list bulk additions of ${resolvedItems.length} items synced to cart.`);
      setVoiceDraftList([]);
      setTranscriptText("");
      setCompletedTranscript("");
      transcriptTextRef.current = "";
    } else {
      onNotify(isUr ? "کارٹ میں شامل کرنے کے لیے کوئی دستیاب پروڈکٹ نہیں ملی۔" : "No available products found to add to cart.", "warning");
    }
  };
  
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

  // ================= AI BILL SCANNER STATE =================
  const [scannerImageFile, setScannerImageFile] = useState(null);
  const [scannerPreviewUrl, setScannerPreviewUrl] = useState(null);
  const [scannerBase64, setScannerBase64] = useState(null);
  const [scannerMimeType, setScannerMimeType] = useState("image/jpeg");
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [extractedDraft, setExtractedDraft] = useState([]); // Array of { name, nameUr, price, qty, category, unit, unitUr }

  // Manual Add Form to help user add newly found/missed items inside scanner list
  const [scannerManualInput, setScannerManualInput] = useState({
    name: "",
    nameUr: "",
    price: 1.99,
    qty: 1,
    category: "Pantry",
    unit: "item",
    unitUr: "عدد"
  });

  // Sync recognition language on drop-down changes
  useEffect(() => {
    setSpeechLanguage(lang === "en" ? "en-US" : "ur-PK");
  }, [lang]);

  // Hook speech recognition instance
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupportSpeech(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = speechLanguage;

    rec.onstart = () => {
      setIsListening(true);
      setMicPermissionDenied(false);
    };

    rec.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      const currentFullText = (finalTranscript + interimTranscript).trim();
      if (currentFullText) {
        setTranscriptText(currentFullText);
        if (parseAndSyncVoiceDraftRef.current) {
          parseAndSyncVoiceDraftRef.current(currentFullText);
        }

        // Reset and schedule 3-second natural silence pause detection to trigger automatic parsing
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          console.log("Silence pause detected. Pausing microphone and processing automatically.");
          shouldAutoRestartRef.current = false;
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch (err) {
              console.log("Error stopping recognition on silence:", err);
            }
          }
          setIsListening(false);
          if (executeAIVoiceParseRef.current) {
            executeAIVoiceParseRef.current(currentFullText);
          }
        }, 3000);
      }
    };

    rec.onerror = (e) => {
      console.error("Speech error logged: ", e.error);
      if (e.error === "not-allowed") {
        setIsListening(false);
        setMicPermissionDenied(true);
        onNotify(t.micError, "error");
      } else if (e.error === "no-speech") {
        // Safe bypass for normal voice pause silence events
        console.log("Ignored no-speech error during continuous session.");
      }
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [speechLanguage, t.micError]);

  const executeAIVoiceParse = async (overrideText) => {
    const textToParse = overrideText || transcriptText;
    if (!textToParse || !textToParse.trim()) {
      return;
    }
    if (isVoiceParsingRef.current) {
      return;
    }

    isVoiceParsingRef.current = true;
    setVoiceLoading(true);

    addLog(isUr ? "صوتی آواز کا تجزیہ کیا جا رہا ہے..." : "Analyzing voice input...");

    try {
      const result = await api.parseVoice(textToParse);
      if (result && Array.isArray(result)) {
        const resolvedItems = [];
        const finalDraftItems = [];
        
        // Start with the latest available products in ref
        const latestProducts = [...(productsRef.current || products || [])];

        for (const item of result) {
          let match = null;
          if (item.productId) {
            match = latestProducts.find(p => String(p.id) === String(item.productId));
          }
          if (!match) {
            match = matchProductFuzzy(item.name, item.nameUr, latestProducts);
          }
          const originallyMatched = match 
            ? !!(match.status !== "Inactive" && match.status !== "Unavailable" && match.status?.toLowerCase() !== "inactive" && match.status?.toLowerCase() !== "unavailable" && (match.stockQuantity === undefined || match.stockQuantity > 0) && match.price > 0)
            : (item.matched === true);

          if (!originallyMatched) {
            // Product is NOT available in the catalog database
            if (match) {
              addLog(isUr
                ? `"${match.name || item.name}" فی الحال اسٹور میں غیر دستیاب ہے یا آؤٹ آف اسٹاک ہے۔`
                : `"${match.name || item.name}" is currently unavailable or out of stock in store.`);
            } else {
              addLog(isUr ? `پروڈکٹ دستیاب نہیں ہے: "${item.name}"` : `Product not available in store: "${item.name}"`);
            }
            
            // Still add to draft items list with matched: false so the user can see it in red,
            // but we do NOT add it to the cart (do not push to resolvedItems).
            const tempId = (match && match.id) || item.productId || ("custom_unmatched_" + Math.random().toString(36).substring(2, 9));
            const draftItem = {
              ...item,
              name: match ? match.name : item.name,
              nameUr: match ? match.nameUr : item.nameUr,
              price: match ? ((match.salePrice && match.salePrice > 0) ? match.salePrice : match.price) : (item.price !== undefined ? item.price : 1.99),
              category: match ? match.category : (item.category || "Pantry"),
              unit: match ? match.unit : (item.unit || "item"),
              unitUr: match ? match.unitUr : (item.unitUr || "عدد"),
              productId: tempId,
              matched: false,
              currencyCode: match ? (match.currencyCode || match.currency || "PKR") : (currency || "USD")
            };
            finalDraftItems.push(draftItem);
          } else {
            // Product IS available in the catalog database
            addLog(isUr ? `پروڈکٹ کی شناخت ہوئی: "${match.name || item.name}"` : `Identified product: "${match.name || item.name}"`);

            const rawId = match.id;
            const resolvedId = isNaN(Number(rawId)) ? rawId : Number(rawId);

            const draftItem = {
              ...item,
              name: match.name || item.name,
              nameUr: match.nameUr || item.nameUr,
              price: (match.salePrice && match.salePrice > 0) ? match.salePrice : (match.price !== undefined ? match.price : item.price),
              category: match.category || item.category,
              unit: match.unit || item.unit,
              unitUr: match.unitUr || item.unitUr,
              productId: resolvedId,
              matched: true,
              currencyCode: match.currencyCode || match.currency || "PKR"
            };
            finalDraftItems.push(draftItem);

            resolvedItems.push({
              productId: resolvedId,
              qty: draftItem.qty,
              action: item.action || "add"
            });
          }
        }

        // Refresh products catalog
        if (onRefreshProducts && resolvedItems.length > 0) {
          await onRefreshProducts();
        }

        setVoiceDraftList(finalDraftItems);

        // Clear transcript after successful add
        setTranscriptText("");
        transcriptTextRef.current = "";

        if (resolvedItems.length > 0) {
          onNotify(
            isUr 
              ? `صوتی تجزیہ مکمل ہو گیا! کارٹ میں شامل کرنے کے لیے 'Add to Cart' کا بٹن دبائیں۔`
              : `Voice parsed successfully! Click 'Add to Cart' below to add items to your cart.`,
            "info"
          );
          addLog(isUr ? "صوتی تجزیہ مکمل ہو گیا۔ ڈرافٹ لسٹ تیار ہے۔" : `Voice parsed successfully. Draft list ready.`);
        } else {
          // If no items were available to add
          onNotify(
            isUr 
              ? "کوئی بھی چیز دستیاب نہیں تھی، کارٹ میں کچھ شامل نہیں کیا گیا۔"
              : "No available products found from your list. Nothing added to cart.",
            "warning"
          );
          addLog(isUr ? "کوئی بھی چیز دستیاب نہیں تھی، کارٹ میں کچھ شامل نہیں کیا گیا۔" : "No available products matched. Zero items added to cart.");
        }
      } else {
        throw new Error(isUr ? "آواز کو سمجھنے میں ناکامی۔" : "Could not process the spoken list.");
      }
    } catch (err) {
      console.error("Voice parse err:", err);
      const msg = isUr ? "صوتی لسٹ پروسیس کرنے میں ناکامی" : "Failed to process shopping list.";
      onNotify(msg, "error");
      addLog(isUr ? "آواز کو سمجھنے میں دشواری پیش آئی۔" : "Could not process the voice list.");
    } finally {
      setVoiceLoading(false);
      isVoiceParsingRef.current = false;
    }
  };
  executeAIVoiceParseRef.current = executeAIVoiceParse;

  const toggleListening = () => {
    if (!supportSpeech) {
      onNotify("Speech execution not supported on this browser version.", "info");
      return;
    }

    if (isListening) {
      // Explicit manual pause - stop recording but KEEP the session active so we never lose progress!
      shouldAutoRestartRef.current = false;
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.log("Error stopping recognition:", err);
        }
      }
      setIsListening(false);
      onNotify(lang === "ur" ? "مائیکرو فون روک دیا گیا، سیشن اب بھی فعال ہے۔" : "Microphone paused. Session remains active.", "info");
    } else {
      // Start a completely fresh new batch (do not mix or append to the previous batch!)
      setTranscriptText("");
      setCompletedTranscript("");
      setVoiceDraftList([]);
      transcriptTextRef.current = "";
      completedTranscriptRef.current = "";
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      setIsSessionActive(true);
      isSessionActiveRef.current = true;
      shouldAutoRestartRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.lang = speechLanguage;
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
          console.error("Speech recognition start failed:", err);
        }
      }
    }
  };

  const processFinishedTranscript = (text) => {
    if (!text || !text.trim()) return;
    
    // Parse commands using bilingual helper
    const result = parseVoiceCommand(text, products);
    
    // Append logs
    if (result.logs && result.logs.length > 0) {
      result.logs.forEach(log => addLog(log));
    }

    if (result.action === "clear_logs") {
      onClearLogs();
      setTranscriptText("");
      setCompletedTranscript("");
      setVoiceDraftList([]);
      onNotify(lang === "ur" ? "صوتی لاگز صاف کر دیے گئے!" : "Voice chat logs cleared!", "info");
    } else if (result.action === "clear") {
      onClearCart();
      setTranscriptText("");
      setCompletedTranscript("");
      setVoiceDraftList([]);
      onNotify(t.cartCleared, "info");
    } else if (result.action === "checkout") {
      onCheckout();
      setTranscriptText("");
      setCompletedTranscript("");
      setVoiceDraftList([]);
    } else if (result.action === "update_items") {
      const draftItems = [];
      const resolvedItems = [];
      
      result.items.forEach(item => {
        const prod = item.productId ? products.find(p => String(p.id) === String(item.productId)) : null;
        const isAvailable = prod && prod.status !== "Inactive" && prod.status !== "Unavailable" && prod.status?.toLowerCase() !== "inactive" && prod.status?.toLowerCase() !== "unavailable" && (prod.stockQuantity === undefined || prod.stockQuantity > 0) && prod.price > 0;
        
        draftItems.push({
          productId: item.productId || ("custom_unmatched_" + Math.random().toString(36).substring(2, 9)),
          qty: item.qty,
          action: "set",
          name: prod ? prod.name : (item.name || `Product #${item.productId}`),
          nameUr: prod ? prod.nameUr : (item.nameUr || `پروڈکٹ #${item.productId}`),
          price: prod ? ((prod.salePrice && prod.salePrice > 0) ? prod.salePrice : prod.price) : (item.price || 1.99),
          category: prod ? prod.category : (item.category || "Pantry"),
          unit: prod ? prod.unit : (item.unit || "item"),
          unitUr: prod ? prod.unitUr : (item.unitUr || "عدد"),
          matched: !!isAvailable,
          confidence: "high",
          currencyCode: prod ? (prod.currencyCode || prod.currency || "PKR") : "USD"
        });

        if (isAvailable) {
          resolvedItems.push({
            productId: item.productId,
            qty: item.qty,
            action: "set"
          });
        } else {
          addLog(isUr 
            ? `پروڈکٹ غیر دستیاب ہے: "${prod ? prod.name : (item.name || "نامعلوم چیز")}"` 
            : `Product is unavailable: "${prod ? prod.name : (item.name || "Custom Item")}"`);
        }
      });

      setVoiceDraftList(draftItems);
      if (resolvedItems.length > 0) {
        onAddItems(resolvedItems);
        const itemsCount = resolvedItems.length;
        onNotify(
          isUr 
            ? `${itemsCount} دستیاب مصنوعات کامیابی سے آپ کے کارٹ میں شامل کر دی گئی ہیں!` 
            : `Parsed and successfully added ${itemsCount} available items to your cart!`, 
          "success"
        );
      } else {
        onNotify(isUr ? "کوئی بھی دستیاب پروڈکٹ نہیں ملی۔" : "No available products found.", "warning");
      }
    } else {
      onNotify(lang === "ur" ? "پتہ نہیں چل سکا، براہ کرم پروڈکٹ کیٹلاگ چیک کریں۔" : "Command terms untracked. Try adding custom products.", "warning");
    }
  };

  // Automatic Recipe Detection on typing in Voice Assistant manual input
  useEffect(() => {
    const query = customText.toLowerCase().trim();
    if (!query) return;

    const RECIPES = [
      {
        key: "biryani",
        phrases: ["chicken biryani", "biryani ke ingredients", "biryani ingredients", "ingredients for chicken biryani", "chicken biryani ingredients", "chicken biryani ke ingredients", "biryani"],
        nameEn: "Chicken Biryani Ingredients",
        nameUr: "چکن بریانی کے اجزاء"
      },
      {
        key: "chai",
        phrases: ["chai", "tea recipe", "tea ingredients", "make tea", "chai ke ingredients", "چائے", "green tea"],
        nameEn: "Chai/Tea Ingredients",
        nameUr: "چائے کے اجزاء"
      },
      {
        key: "friedRice",
        phrases: ["fried rice", "egg fried rice", "fried rice ingredients", "fried rice recipe"],
        nameEn: "Egg Fried Rice Ingredients",
        nameUr: "فرائیڈ رائس کے اجزاء"
      },
      {
        key: "omelette",
        phrases: ["omelette", "omlet", "egg omelette", "omelette recipe", "omelette ingredients"],
        nameEn: "Omelette Ingredients",
        nameUr: "آملیٹ کے اجزاء"
      },
      {
        key: "karahi",
        phrases: ["chicken karahi", "karahi recipe", "karahi ingredients", "karahi ke ingredients", "karahi"],
        nameEn: "Chicken Karahi Ingredients",
        nameUr: "چکن کڑاہی کے اجزاء"
      },
      {
        key: "nihari",
        phrases: ["nihari", "beef nihari", "nihari recipe", "nihari ingredients"],
        nameEn: "Nihari Ingredients",
        nameUr: "نہاری کے اجزاء"
      },
      {
        key: "pasta",
        phrases: ["pasta", "chicken pasta", "alfredo pasta", "pasta recipe", "pasta ingredients"],
        nameEn: "Chicken Pasta Ingredients",
        nameUr: "پاستا کے اجزاء"
      },
      {
        key: "pizza",
        phrases: ["pizza", "homemade pizza", "pizza recipe", "pizza ingredients"],
        nameEn: "Pizza Ingredients",
        nameUr: "پیزا کے اجزاء"
      },
      {
        key: "burger",
        phrases: ["burger", "chicken burger", "burger recipe", "burger ingredients"],
        nameEn: "Burger Ingredients",
        nameUr: "برگر کے اجزاء"
      },
      {
        key: "kheer",
        phrases: ["kheer", "sweet dish", "kheer recipe", "kheer ingredients"],
        nameEn: "Kheer Ingredients",
        nameUr: "کھیر کے اجزاء"
      },
      {
        key: "fruits",
        phrases: ["add all fruits", "all fruits", "healthy fruits", "healthy fruit", "fruits add karo", "phal add karo", "sare phal", "saare phal", "sare phalo", "saaray phal", "تمام پھل", "fruits", "fruit"],
        nameEn: "All Fruits",
        nameUr: "تمام پھل"
      },
      {
        key: "vegetables",
        phrases: ["add all vegetables", "all vegetables", "vegetables", "vegetable", "sabzi", "sabziyaan", "sabziyan", "sabzi add karo", "sari sabziyaan", "sari sabziyan", "saari sabziyan", "تمام سبزیاں"],
        nameEn: "All Vegetables",
        nameUr: "تمام سبزیاں"
      },
      {
        key: "dairy",
        phrases: ["add all dairy", "all dairy", "dairy items", "sare dairy", "saari dairy", "تمام ڈیری", "ڈیری"],
        nameEn: "All Dairy",
        nameUr: "تمام ڈیری"
      },
      {
        key: "beverages",
        phrases: ["add all beverages", "all beverages", "all drinks", "sare drinks", "saari drinks", "drinks", "beverages", "مشروبات"],
        nameEn: "All Beverages",
        nameUr: "تمام مشروبات"
      },
      {
        key: "meat",
        phrases: ["add all meat", "all meat", "meat items", "sare meat", "saari meat", "گوشت", "تمام گوشت"],
        nameEn: "All Meat & Poultry",
        nameUr: "تمام گوشت"
      },
      {
        key: "pantry",
        phrases: ["add all pantry", "all pantry", "pantry items", "sare pantry", "پینٹری", "تمام پینٹری"],
        nameEn: "All Pantry & Staples",
        nameUr: "تمام پینٹری"
      },
      {
        key: "recipeIngredients",
        phrases: ["recipe ingredients", "all recipe products", "all recipes", "recipe items", "recipe products", "recipe products list"],
        nameEn: "Recipe Ingredients",
        nameUr: "نسخہ کے اجزاء"
      },
      {
        key: "healthyFoods",
        phrases: ["healthy foods", "healthy food", "healthy items", "healthy products", "healthy groceries", "sehat bakhsh khorak"],
        nameEn: "Healthy Foods",
        nameUr: "صحت بخش غذائیں"
      }
    ];

    const matched = RECIPES.find(recipe => 
      recipe.phrases.some(p => query === p)
    );

    if (matched) {
      const parsed = parseVoiceCommand(query, products);
      if (parsed.action === "update_items" && parsed.items && parsed.items.length > 0) {
        const resolvedItems = [];
        const finalDraftItems = [];
        const latestProducts = [...(products || [])];

        for (const item of parsed.items) {
          let match = null;
          const searchId = item.productId || item.id;
          if (searchId) {
            match = latestProducts.find(p => String(p.id) === String(searchId));
          }
          if (!match && item.name) {
            match = matchProductFuzzy(item.name, item.nameUr, latestProducts);
          }
          const originallyMatched = match 
            ? !!(match.status !== "Inactive" && match.status !== "Unavailable" && match.status?.toLowerCase() !== "inactive" && match.status?.toLowerCase() !== "unavailable" && (match.stockQuantity === undefined || match.stockQuantity > 0) && match.price > 0)
            : (item.matched === true);

          const tempId = (match && match.id) || item.productId || item.id || ("custom_unmatched_" + Math.random().toString(36).substring(2, 9));
          const draftItem = {
            ...item,
            name: match ? match.name : item.name,
            nameUr: match ? match.nameUr : item.nameUr,
            price: match ? match.price : (item.price !== undefined ? item.price : 1.99),
            category: match ? match.category : (item.category || "Pantry"),
            unit: match ? match.unit : (item.unit || "item"),
            unitUr: match ? match.unitUr : (item.unitUr || "عدد"),
            productId: tempId,
            matched: originallyMatched,
            currencyCode: match ? (match.currencyCode || match.currency || "PKR") : (currency || "USD")
          };
          finalDraftItems.push(draftItem);

          if (originallyMatched && match) {
            const rawId = match.id;
            const resolvedId = isNaN(Number(rawId)) ? rawId : Number(rawId);
            resolvedItems.push({
              productId: resolvedId,
              qty: draftItem.qty,
              action: item.action || "add"
            });
          }
        }

        setVoiceDraftList(finalDraftItems);
        setCustomText(""); // Reset typing input

        if (resolvedItems.length > 0) {
          onAddItems(resolvedItems);
          const dispName = lang === "ur" ? matched.nameUr : matched.nameEn;
          const msg = lang === "ur" 
            ? `ترکیب "${dispName}" کے تمام دستیاب اجزاء کامیابی سے آپ کے کارٹ میں شامل کر دیے گئے ہیں!` 
            : `Ingredients for "${dispName}" successfully added to your cart!`;
          onNotify(msg, "success");
          addLog(lang === "ur" ? `ترکیب "${dispName}" کے اجزاء کارٹ میں شامل کر دیے گئے۔` : `Recipe "${dispName}" ingredients added to cart.`);
        }
      }
    }
  }, [customText, products, lang, currency, onAddItems, onNotify, addLog]);

  
  const handleRecipeSearch = async (queryText) => {
    const textToSearch = queryText || customText || transcriptText;
    if (!textToSearch || !textToSearch.trim()) return;

    setRecipeLoading(true);
    addLog(isUr ? `ریسپی تلاش کی جا رہی ہے: "${textToSearch}"` : `Searching recipe database for: "${textToSearch}"`);
    try {
      const res = await api.searchRecipe(textToSearch, lang, currency);
      if (res && res.recipe) {
        const rec = res.recipe;
        setRecipeCard(rec);

        const draftItems = (rec.ingredients || []).map(ing => ({
          productId: ing.productId || ("custom_recipe_" + Math.random().toString(36).substring(2, 9)),
          qty: ing.qty || 1,
          action: "set",
          name: ing.name,
          nameUr: ing.nameUr,
          price: ing.price || 1.99,
          category: ing.category || "Pantry",
          unit: ing.unit || "pack",
          unitUr: ing.unitUr || "پیکٹ",
          matched: !!ing.matched,
          currencyCode: ing.currencyCode || "PKR"
        }));

        setVoiceDraftList(draftItems);

        const title = isUr ? (rec.nameUr || rec.nameEn) : rec.nameEn;
        const availCount = (rec.ingredients || []).filter(i => i.matched).length;
        const ttsMessage = isUr
          ? `میں نے ${title} کی ترکیب تلاش کر لی ہے۔ اس کے لیے ${rec.ingredients.length} اجزاء درکار ہیں اور ${availCount} اسٹور میں دستیاب ہیں۔`
          : `Found recipe for ${title}! It requires ${rec.ingredients.length} ingredients with ${availCount} available in store.`;

        addLog(ttsMessage);
        speakText(ttsMessage, lang);
        onNotify(isUr ? `${title} کی ترکیب مل گئی!` : `Found recipe for ${title}!`, "success");
      }
    } catch (err) {
      console.error("Recipe search error:", err);
      onNotify(isUr ? "ریسپی تلاش میں ناکامی" : "Failed to search recipe.", "error");
    } finally {
      setRecipeLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    executeAIVoiceParse(customText);
    setCustomText("");
  };

  // ================= AI BILL SCANNER ACTIONS =================
  const handleScannerFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setupScannerImageFile(file);
  };

  const compressScannerImage = (file, maxWidth, maxHeight, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        // Use quality 0.7 JPEG to dramatically shrink the payload size to prevent any HTTP 413 errors
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        callback(dataUrl);
      };
      img.onerror = () => {
        // Fallback to uncompressed Base64 data url if image failed to load in Canvas
        callback(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const setupScannerImageFile = (file) => {
    setScannerMimeType("image/jpeg");
    setScannerPreviewUrl(URL.createObjectURL(file));
    setScannerImageFile(file);
    setScannerError("");

    // Compress client image seamlessly
    compressScannerImage(file, 1024, 1024, (compressedBase64) => {
      setScannerBase64(compressedBase64);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setupScannerImageFile(file);
    } else {
      onNotify("Invalid file format. Please upload a receipt or bill photo.", "error");
    }
  };

  const executeAIInvoiceScan = async () => {
    if (!scannerBase64) {
      onNotify(isUr ? "براہ کرم پہلے کوئی بل یا رسید منتخب کریں یا ڈراپ کریں۔" : "Please select or drop an invoice/bill scan first.", "warning");
      return;
    }
    setScannerLoading(true);
    setScannerError("");
    setExtractedDraft([]);
    addLog(isUr ? "رسید کی تصویر اسکین کی جا رہی ہے..." : "Scanning receipt image...");

    try {
      const result = await api.processOcr(scannerBase64, scannerMimeType);
      if (result && Array.isArray(result)) {
        // Step 1: Filter out low-confidence OCR / billing summary lines
        const noiseWords = [
          'total', 'subtotal', 'tax', 'gst', 'vat', 'discount', 'balance', 'change', 
          'cash', 'visa', 'mastercard', 'invoice', 'receipt', 'date', 'amount', 
          'cashier', 'billing', 'tel', 'phone', 'address', 'store', 'market', 
          'welcome', 'thank you', 'payment', 'card', 'customer', 'shoppe', 
          'bazaar', 'item count', 'items count', 'qty total', 'quantity total', 
          'discount total', 'grand total', 'net total', 'round off', 'gross amt', 
          'net amt'
        ];
        
        const filteredResult = result.filter(item => {
          if (!item.name || typeof item.name !== 'string') return false;
          const lowerName = item.name.toLowerCase().trim();
          if (lowerName.length < 2) return false;
          
          const isNoise = noiseWords.some(word => 
            lowerName === word || lowerName.includes(" " + word) || lowerName.includes(word + " ")
          );
          if (isNoise) return false;
          
          if (item.price !== undefined && parseFloat(item.price) < 0) return false;
          return true;
        });

        // Step 2: Use items directly without merging duplicates to respect original receipt quantities
        const formatted = filteredResult.map(rawItem => ({
          name: rawItem.name || "Custom Scanned Item",
          nameUr: rawItem.nameUr || rawItem.name || "سکین شدہ چیز",
          price: typeof rawItem.price === "number" ? rawItem.price : 1.99,
          qty: typeof rawItem.qty === "number" && rawItem.qty > 0 ? rawItem.qty : 1,
          category: rawItem.category || "Pantry",
          unit: rawItem.unit || "item",
          unitUr: rawItem.unitUr || "عدد",
          productId: rawItem.productId || null,
          matched: rawItem.matched !== undefined ? rawItem.matched : null,
          currencyCode: rawItem.currencyCode || null
        }));
        
        addLog(isUr ? `رسید کامیابی سے اسکین ہو گئی۔ ${formatted.length} منفرد اشیاء کی فہرست تیار کی گئی۔` : `Successfully scanned receipt and compiled ${formatted.length} items.`);

        // Step 3: Match with existing catalog (fuzzy matching fallback)
        const resolvedItems = [];
        const finalDraftItems = [];

        for (const scanned of formatted) {
          let match = null;
          if (scanned.productId) {
            match = products.find(p => String(p.id) === String(scanned.productId));
          }
          if (!match) {
            match = matchProductFuzzy(scanned.name, scanned.nameUr, products);
          }

          // Use the backend matched status if available, else do client status & stock checks
          const isMatched = match 
            ? !!(match.status !== "Inactive" && match.status !== "Unavailable" && match.status?.toLowerCase() !== "inactive" && match.status?.toLowerCase() !== "unavailable" && (match.stockQuantity === undefined || match.stockQuantity > 0) && match.price > 0)
            : (scanned.matched === true);

          if (!isMatched) {
            if (match) {
              addLog(isUr 
                ? `"${match.name || scanned.name}" فی الحال اسٹور میں غیر دستیاب ہے یا آؤٹ آف اسٹاک ہے۔ اسے غیر دستیاب کے طور پر نشان زد کیا گیا۔` 
                : `"${match.name || scanned.name}" is currently unavailable or out of stock in store. Marked as Unavailable.`);
            } else {
              addLog(isUr ? `"${scanned.name}" کیٹلاگ میں نہیں ملی۔ اسے غیر دستیاب کے طور پر نشان زد کیا گیا۔` : `"${scanned.name}" not found in catalogue. Marked as Unavailable.`);
            }
          } else {
            addLog(isUr ? `"${match.name}" کیٹلاگ میں مل گئی۔` : `"${match.name}" matched with catalog.`);
          }

          const draftItem = {
            ...scanned,
            name: match ? match.name : scanned.name,
            nameUr: match ? match.nameUr : scanned.nameUr,
            price: match ? ((match.salePrice && match.salePrice > 0) ? match.salePrice : match.price) : scanned.price,
            category: match ? match.category : scanned.category,
            unit: match ? match.unit : scanned.unit,
            unitUr: match ? match.unitUr : scanned.unitUr,
            productId: match ? match.id : null,
            matched: isMatched,
            confidence: isMatched ? "high" : "low",
            currencyCode: match ? (match.currencyCode || match.currency || "PKR") : (scanned.currencyCode || "USD")
          };
          finalDraftItems.push(draftItem);

          if (isMatched) {
            resolvedItems.push({
              productId: draftItem.productId,
              qty: draftItem.qty,
              action: "set" // Use "set" to overwrite directly with perfect scanned quantities
            });
          }
        }

        setExtractedDraft(finalDraftItems);

        // Auto-add matched items to cart as requested by user
        if (resolvedItems.length > 0) {
          onAddItems(resolvedItems);
        }

        const matchedCount = finalDraftItems.filter(item => item.matched).length;
        if (matchedCount > 0) {
          onNotify(
            isUr 
              ? `رسید کامیابی سے اسکین ہو گئی! ${matchedCount} دستیاب اشیاء خودکار طور پر آپ کے کارٹ میں شامل کر دی گئی ہیں۔` 
              : `Successfully scanned and added ${matchedCount} available items to your cart!`, 
            "success"
          );
          addLog(isUr ? `اسکین شدہ بل کا کامیابی سے تجزیہ کیا گیا اور کارٹ میں شامل کیا گیا۔` : `Successfully analyzed scanned receipt and added matched items to cart.`);
        } else {
          onNotify(
            isUr
              ? "رسید اسکین کر لی گئی ہے، لیکن کوئی دستیاب پروڈکٹ نہیں ملی۔"
              : "Receipt scanned, but no matching products were found in our catalog. Unmatched items are marked as Unavailable.",
            "warning"
          );
        }

        // Clear scanner file inputs but keep the draft view for confirmation
        setScannerImageFile(null);
        setScannerPreviewUrl(null);
        setScannerBase64(null);
      } else {
        let errorText = (isUr ? "رسید کی ترتیب کو سمجھنے میں ناکامی۔ براہ کرم واضح تصویر آزمائیں۔" : "Unable to structure the invoice items. Please try again with a clearer photo.");
        throw new Error(errorText);
      }
    } catch (err) {
      console.error("AI Bill scan err:", err);
      // Clean up the error message
      let errorMsg = err.message || (isUr ? "رسید پروسیس کرنے میں ناکامی" : "Failed to process receipt.");
      if (errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        errorMsg = "API Quota Exceeded. Please configure a valid API key in Settings or try again later.";
      } else if (errorMsg.length > 100) {
        errorMsg = isUr ? "رسید پروسیس کرنے میں ناکامی" : "Failed to process receipt.";
      }
      setScannerError(errorMsg);
      onNotify(errorMsg, "error");
      addLog(errorMsg);
    } finally {
      setScannerLoading(false);
    }
  };

  // Modify individual draft rows
  const updateDraftRow = (index, field, value) => {
    setExtractedDraft(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeDraftRow = (index) => {
    setExtractedDraft(prev => prev.filter((_, i) => i !== index));
    onNotify("Item dismissed.", "info");
  };

  // Add individual custom items in scanned summary
  const addScannerManualItemSubmit = async (e) => {
    e.preventDefault();
    if (!scannerManualInput.name.trim()) {
      onNotify("Please specify an item name to add.", "warning");
      return;
    }
    
    // Check if item exists in catalog (exact or fuzzy match) and is available
    const match = matchProductFuzzy(scannerManualInput.name.trim(), scannerManualInput.nameUr.trim(), products);
    const isAvailable = match && match.status !== "Inactive" && match.status !== "Unavailable" && match.status?.toLowerCase() !== "inactive" && match.status?.toLowerCase() !== "unavailable" && (match.stockQuantity === undefined || match.stockQuantity > 0) && match.price > 0;
    if (!isAvailable) {
      onNotify(
        isUr
          ? `مصنوعات "${scannerManualInput.name}" فی الحال اسٹور میں غیر دستیاب ہے یا آؤٹ آف اسٹاک ہے۔`
          : `Product "${scannerManualInput.name}" is currently unavailable or out of stock. You cannot add it.`,
        "error"
      );
      return;
    }

    const newItem = {
      name: match.name,
      nameUr: match.nameUr || match.name,
      price: (match.salePrice && match.salePrice > 0) ? match.salePrice : match.price,
      qty: parseInt(scannerManualInput.qty) || 1,
      category: match.category,
      unit: match.unit,
      unitUr: match.unitUr,
      productId: match.id,
      matched: true,
      confidence: "high",
      currencyCode: match.currencyCode || match.currency || "PKR"
    };

    setExtractedDraft(prev => [...prev, newItem]);

    setScannerManualInput({
      name: "",
      nameUr: "",
      price: 1.99,
      qty: 1,
      category: "Pantry",
      unit: "item",
      unitUr: "عدد"
    });
    onNotify(`Added '${newItem.name}' to review list!`, "success");
  };

  // Map and add raw scanned items to active cart state
  const handleAddScannerItemsToCart = () => {
    if (extractedDraft.length === 0) return;

    // Synchronize adjusted quantities from our draft review to the active cart state using set action (only add matched/available products)
    const resolvedItems = extractedDraft
      .filter(scanned => scanned.matched && scanned.productId)
      .map(scanned => ({
        productId: scanned.productId,
        qty: scanned.qty,
        action: "set"
      }));

    if (resolvedItems.length > 0) {
      onAddItems(resolvedItems);
      onNotify(isUr ? `کامیابی سے ${resolvedItems.length} اشیاء کارٹ کے ساتھ ہم آہنگ کر دی گئیں۔` : `Successfully synchronized ${resolvedItems.length} available items with your active cart!`, "success");
      addLog(`Scanned cart synchronized with ${resolvedItems.length} available items.`);
    } else {
      onNotify(isUr ? "کارٹ میں شامل کرنے کے لیے کوئی دستیاب پروڈکٹ نہیں ملی۔" : "No available products found to add to cart.", "warning");
    }
    
    // Clear state
    setExtractedDraft([]);
    setScannerImageFile(null);
    setScannerPreviewUrl(null);
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Dynamic Tab Selector for User Side Utilities */}
      <div className="flex items-center justify-between border border-white/10 p-2 rounded-2xl bg-white/5 backdrop-blur-md max-w-lg mx-auto w-full select-none">
        <button
          onClick={() => setActiveMode("voice")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeMode === "voice"
              ? "bg-purple-500 text-slate-950 shadow-md shadow-purple-500/10"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
          id="tab-voice-assistant"
        >
          <Mic size={14} />
          <span>{isUr ? "صوتی معاون" : "Voice Assistant"}</span>
        </button>
        <button
          onClick={() => setActiveMode("scanner")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeMode === "scanner"
              ? "bg-purple-500 text-slate-950 shadow-md shadow-purple-500/10"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
          id="tab-invoice-scanner"
        >
          <FileText size={14} />
          <span>{isUr ? "انوائس سکینر" : "AI Bill Scanner"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ==================== LEFT CONSOLE MODULE ==================== */}
        <div className="lg:col-span-7 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col justify-between min-h-[520px]">
          
          {/* VIEW: VOICE COMMAND MODULE */}
          {activeMode === "voice" && (
            <div className="flex flex-col items-center justify-between h-full w-full gap-6">
              {/* Voice Header */}
              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="p-1 px-3 rounded-full bg-purple-400/10 border border-purple-500/20 text-xs font-semibold text-purple-300 font-display uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <Sparkles size={11} className="animate-spin text-purple-400" />
                    <span>Voice Recognition Hub</span>
                  </span>
                </div>
                <h2 className="font-display font-bold text-2xl text-white mb-2 tracking-tight">
                  {t.speakYourList}
                </h2>
                <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
                  {t.speakSummary}
                </p>
              </div>

              {/* Pulsing micro circles */}
              <div className="relative my-4 flex items-center justify-center">
                {isListening && (
                  <>
                    <div className="absolute inset-0 w-32 h-32 bg-purple-400/20 rounded-full animate-ping" />
                    <div className="absolute inset-0 w-36 h-36 bg-purple-500/10 rounded-full animate-pulse my-auto" />
                  </>
                )}

                <button
                  onClick={toggleListening}
                  className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 border cursor-pointer hover:shadow-2xl ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600 border-red-400 mic-active-glow animate-pulse"
                      : "bg-gradient-to-tr from-purple-400 via-indigo-500 to-indigo-600 hover:from-purple-300 hover:to-indigo-500 border-white/20 shadow-lg shadow-purple-500/20"
                  }`}
                  id="btn-voice-mic-trigger"
                >
                  {isListening ? (
                    <MicOff size={44} className="text-white" />
                  ) : (
                    <Mic size={44} className="text-white" />
                  )}
                </button>
              </div>

              {/* Listener status text */}
              <div className="w-full text-center">
                <div className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
                  {isListening ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-red-400 font-semibold text-xs tracking-wider uppercase">{t.micListening}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      <span className="text-purple-300 font-semibold text-xs tracking-wider uppercase">{t.speakStatusReady}</span>
                    </>
                  )}
                </div>

                {isListening && (
                  <div className="flex gap-1 items-center justify-center mt-3 animate-pulse">
                    <span className="w-1 h-3.5 bg-purple-400 rounded-full animate-bounce" />
                    <span className="w-1 h-5 bg-purple-300 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-1 h-7 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-4 bg-purple-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                    <span className="w-1 h-2.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}

                {isSessionActive && !isListening && (
                  <div className="mt-2 text-[10px] text-amber-300 font-semibold animate-pulse tracking-wide uppercase">
                    {isUr ? "وقوف (بولنا جاری رکھیں)..." : "Paused (Start speaking again to continue)..."}
                  </div>
                )}

                <div className="flex flex-col gap-2.5 max-w-sm mx-auto w-full mt-4">
                  <div className="min-h-[48px] px-4 py-3 rounded-xl bg-slate-900/40 text-white/80 italic text-xs border border-white/5 flex items-center justify-center leading-relaxed">
                    {transcriptText ? `"${transcriptText}"` : `"${t.micInstruction}"`}
                  </div>
                  
                  {transcriptText && (
                    <button
                      type="button"
                      onClick={() => executeAIVoiceParse()}
                      disabled={voiceLoading}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
                      id="btn-voice-ai-extract"
                    >
                      {voiceLoading ? (
                        <>
                          <Loader2 size={13} className="animate-spin text-slate-950" />
                          <span>{isUr ? "پروسیسنگ..." : "Processing voice list..."}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} className="animate-pulse text-slate-950" />
                          <span>{isUr ? "کارٹ میں شامل کریں" : "Add to Cart"}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* ACTIVE VOICE SESSION BULK LIST DRAFT */}
                {voiceDraftList.length > 0 && (
                  <div className="w-full border border-purple-500/20 rounded-xl p-4 bg-slate-950/60 flex flex-col gap-3 animate-slide-in mt-4 text-left max-w-md mx-auto">
                    <h4 className="text-[11px] font-bold text-purple-300 uppercase tracking-widest flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Mic size={12} className="text-purple-400 animate-pulse" />
                        <span>{isUr ? "فعال صوتی بلک لسٹ" : "Active Voice Bulk List"}</span>
                      </span>
                      <span className="text-white/40 font-mono text-[9px] lowercase font-normal">
                        {voiceDraftList.length} {isUr ? "اشیاء" : "items detected"}
                      </span>
                    </h4>

                    <div className="max-h-[220px] overflow-y-auto flex flex-col gap-4 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                      
                      {/* Available section */}
                      {voiceDraftList.some(item => item.matched) && (
                        <div className="flex flex-col gap-1.5">
                          <h5 className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span>{isUr ? "دستیاب مصنوعات" : "Available Products"}</span>
                          </h5>
                          {voiceDraftList.filter(item => item.matched).map((item, idx) => (
                            <div 
                              key={`avail-${idx}`} 
                              className="flex items-center justify-between border border-green-500/20 bg-green-500/5 hover:border-green-500/35 p-2 rounded-xl text-xs transition duration-300"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                <span className="font-semibold text-white">
                                  {isUr ? item.nameUr : item.name}
                                </span>
                                <span className="px-1 rounded text-[7px] font-bold tracking-tight uppercase ml-1 bg-green-500/25 text-green-300">
                                  {isUr ? "کیٹلاگ" : "match"}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-lg font-bold font-mono text-[11px]">
                                  Qty: {item.qty} {isUr ? item.unitUr : item.unit}
                                </span>
                                <span className="text-white/40 text-[10px] font-mono">
                                  {formatPrice(item.price * item.qty, currency, lang, item.currencyCode)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Unavailable section */}
                      {voiceDraftList.some(item => !item.matched) && (
                        <div className="flex flex-col gap-1.5">
                          <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                            <span>{isUr ? "غیر دستیاب مصنوعات" : "Unavailable Products"}</span>
                          </h5>
                          {voiceDraftList.filter(item => !item.matched).map((item, idx) => (
                            <div 
                              key={`unavail-${idx}`} 
                              className="flex items-center justify-between border border-red-500/25 bg-red-500/5 hover:border-red-500/40 p-2 rounded-xl text-xs transition duration-300 animate-pulse"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                <span className="font-semibold text-white/70">
                                  {isUr ? item.nameUr : item.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-xs text-red-400 bg-red-500/10 px-2.5 py-1 rounded-xl border border-red-500/20 select-none">
                                  {isUr ? "غیر دستیاب" : "Unavailable"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>

                    <div className="flex gap-2 border-t border-white/5 pt-2">
                      <button
                        type="button"
                        onClick={handleAddVoiceItemsToCart}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 font-bold text-[10px] py-2 rounded-lg transition cursor-pointer text-center select-none active:scale-95 uppercase tracking-wide"
                        id="btn-voice-bulk-add"
                      >
                        {isUr ? "کارٹ میں شامل کریں" : "Add to Cart"}
                      </button>
                      <button
                        type="button"
                        onClick={handleStartNewBulkEntry}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 font-bold text-[10px] py-2 rounded-lg transition cursor-pointer text-center select-none active:scale-95 uppercase tracking-wide"
                      >
                        {isUr ? "نیا صوتی اندراج" : "New Entry"}
                      </button>
                    </div>
                  </div>
                )}

                {micPermissionDenied && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-left max-w-md mx-auto leading-relaxed flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle size={14} className="shrink-0 text-amber-400" />
                      <span>Microphone Access Blocked (not-allowed)</span>
                    </div>
                    <p>
                      {isUr ? (
                        "کروم سیکیورٹی قوانین کے تحت، یہ ایپ ایک فریم کے اندر چل رہی ہے جہاں مائیکروفون بلاک ہو سکتا ہے۔ اس فیچر کو فوری اور درست طور پر چلانے کے لیے براہ کرم اسکرین کے اوپر دائیں کونے میں 'Open App in New Tab' آئیکون پر کلک کریں۔"
                      ) : (
                        "Browsers block microphone access inside sandboxed iframes. To use speech commands easily, please click the 'Open App in New Tab' button in the top-right corner of the window to run VoxCart natively."
                      )}
                    </p>
                    <div className="flex gap-2 mt-2 border-t border-white/5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (manualInputRef.current) {
                            manualInputRef.current.focus();
                          }
                        }}
                        className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold py-1.5 px-3 rounded-lg transition cursor-pointer text-center select-none active:scale-95 uppercase tracking-wide"
                      >
                        {isUr ? "ہاتھ سے ٹائپ کریں" : "Type Manually Instead"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMicPermissionDenied(false);
                          toggleListening();
                        }}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold py-1.5 px-3 rounded-lg transition cursor-pointer text-center select-none active:scale-95 uppercase tracking-wide"
                      >
                        {isUr ? "دوبارہ مائیک آزمائیں" : "Retry Microphone"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings selectors / Manual input */}
              <div className="w-full border-t border-white/10 pt-4 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Volume2 size={12} className="text-purple-400" />
                    <span>Recognizer Input Settings</span>
                  </span>
                  <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10 text-xs">
                    <span className="text-white/50 font-medium select-none">Lang:</span>
                    <select
                      value={speechLanguage}
                      onChange={(e) => setSpeechLanguage(e.target.value)}
                      className="bg-transparent text-white font-bold outline-none cursor-pointer border-none"
                    >
                      <option value="en-US" className="bg-slate-950">🇺🇸 English (US)</option>
                      <option value="ur-PK" className="bg-slate-950">🇵🇰 Urdu (پاکستانی)</option>
                    </select>
                  </div>
                </div>

                <div className="mb-2.5 px-1 flex items-center gap-2 text-purple-300 font-semibold text-xs">
                  <span className="p-1 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">✨</span>
                  <span>{isUr ? "کسی بھی ترکیب کا نام ٹائپ کریں اور مطلوبہ اشیاء حاصل کریں۔" : "Type any recipe and get the required items."}</span>
                </div>

                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    ref={manualInputRef}
                    type="text"
                    placeholder={isUr ? "کسی بھی ترکیب کا نام ٹائپ کریں (مثال: Biryani)..." : "Type any recipe and get the required items..."}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="flex-1 bg-white/5 text-white placeholder-white/35 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                    dir={isUr ? "rtl" : "ltr"}
                  />
                  <button
                    type="submit"
                    className="bg-purple-500 hover:bg-purple-400 text-slate-950 p-3 rounded-xl active:scale-95 transition cursor-pointer font-bold shadow-md shadow-purple-500/10"
                    title={isUr ? "صوتی ڈرافٹ بنائیں" : "Parse Voice/Text"}
                  >
                    <Send size={18} />
                  </button>
                </form>

                {/* AI INTERACTIVE RECIPE & COOKING GUIDE CARD */}
                {recipeCard && (
                  <div className="w-full border border-purple-500/30 bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 flex flex-col gap-4 text-left shadow-2xl animate-fade-in mt-4">
                    <div className="flex items-start justify-between border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="p-1 px-2.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <span>🍳</span>
                            <span>{recipeCard.category || "AI Recipe"}</span>
                          </span>
                          <span className="text-white/50 text-[10px]">🔥 {recipeCard.calories || "450 kcal"}</span>
                        </div>
                        <h3 className="font-display font-bold text-xl text-white">
                          {isUr ? (recipeCard.nameUr || recipeCard.nameEn) : recipeCard.nameEn}
                        </h3>
                        <p className="text-white/60 text-xs mt-0.5">
                          {isUr ? (recipeCard.descriptionUr || recipeCard.descriptionEn) : recipeCard.descriptionEn}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRecipeCard(null)}
                        className="text-white/40 hover:text-white text-xs p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center bg-white/5 p-2.5 rounded-xl border border-white/10 text-xs">
                      <div>
                        <div className="text-white/40 text-[9px] uppercase font-bold">{isUr ? "تیاری" : "Prep"}</div>
                        <div className="text-purple-300 font-bold">{recipeCard.prepTime || "15m"}</div>
                      </div>
                      <div>
                        <div className="text-white/40 text-[9px] uppercase font-bold">{isUr ? "پکانا" : "Cook"}</div>
                        <div className="text-indigo-300 font-bold">{recipeCard.cookTime || "30m"}</div>
                      </div>
                      <div>
                        <div className="text-white/40 text-[9px] uppercase font-bold">{isUr ? "افراد" : "Servings"}</div>
                        <div className="text-amber-300 font-bold">{recipeCard.servings || "4"}</div>
                      </div>
                      <div>
                        <div className="text-white/40 text-[9px] uppercase font-bold">{isUr ? "مشکل" : "Difficulty"}</div>
                        <div className="text-green-300 font-bold">{recipeCard.difficulty || "Easy"}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const steps = (isUr ? recipeCard.instructionsUr : recipeCard.instructionsEn) || [];
                          const speechText = `${isUr ? recipeCard.nameUr : recipeCard.nameEn}. ${steps.join(". ")}`;
                          speakText(speechText, lang);
                        }}
                        className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                      >
                        <span>🔊 {isUr ? "ہدایت سنیں" : "Read Steps Out Loud"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddVoiceItemsToCart}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-md"
                      >
                        <span>🛒 {isUr ? "اجزاء کارٹ میں ڈالیں" : "Add Recipe Ingredients"}</span>
                      </button>
                    </div>

                    {((isUr ? recipeCard.instructionsUr : recipeCard.instructionsEn) || []).length > 0 && (
                      <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>👨‍🍳 {isUr ? "پکانے کا طریقہ (Step-by-Step Instructions):" : "Step-by-Step Instructions:"}</span>
                        </h4>
                        <ol className="flex flex-col gap-2 pl-1">
                          {((isUr ? recipeCard.instructionsUr : recipeCard.instructionsEn) || []).map((step, sIdx) => (
                            <li key={sIdx} className="text-xs text-white/80 leading-relaxed flex items-start gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                              <span className="font-bold text-purple-400 shrink-0">{sIdx + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* VIEW: AI RECEIPT/BILL SCANNER MODULE */}
          {activeMode === "scanner" && (
            <div className="flex flex-col w-full h-full justify-between gap-6">
              
              {/* Header */}
              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="p-1 px-3 rounded-full bg-indigo-400/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 font-display uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <Sparkles size={11} className="text-indigo-400 animate-spin" />
                    <span>AI Smart Scan</span>
                  </span>
                </div>
                <h2 className="font-display font-bold text-2xl text-white mb-1.5 tracking-tight">
                  {isUr ? "آئی پیپر بل سکینر" : "AI Paper Invoice Scanner"}
                </h2>
                <p className="text-white/60 text-xs max-w-md mx-auto leading-relaxed">
                  {isUr 
                    ? "کسی بھی دکان کے رسید کی تصویر اپ لوڈ کریں۔ ہمارا اے آئی سیکنڈوں میں تمام چیزیں پڑھ کر آپ کے لیے ایک ڈیجیٹل لسٹ تیار کرے گا!"
                    : "Upload a photo of your printed bill, handwritings, or store list. Our AI will scan and build an instant cart additions draft!"}
                </p>
              </div>

              {/* Drag-and-drop / Preview Box */}
              <div className="flex-1 min-h-[160px] flex flex-col justify-center">
                {!scannerPreviewUrl ? (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-white/15 hover:border-purple-500/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition bg-black/25 hover:bg-black/40 cursor-pointer text-center relative group"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScannerFileChange}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <UploadCloud size={40} className="text-purple-400/50 group-hover:text-purple-400 transition transform group-hover:scale-105 duration-350" />
                    <div>
                      <p className="text-xs font-bold text-white/85">
                        {isUr ? "اپنی رسید کی کلک کریں یا فائل یہاں کھینچیں" : "Drag & Drop invoice photo here or Browse"}
                      </p>
                      <p className="text-[10px] text-white/40 mt-1">Accepts receipts, lists, orders invoices (PNG, JPG, WEBP)</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/35 border border-white/10 p-4 rounded-xl relative group">
                    <button
                      onClick={() => {
                        setScannerImageFile(null);
                        setScannerPreviewUrl(null);
                        setScannerBase64(null);
                        setExtractedDraft([]);
                      }}
                      className="absolute -top-2.5 -right-2.5 p-1.5 bg-red-500 hover:bg-red-600 border border-red-400 text-white rounded-full transition shadow-lg shrink-0 cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 size={12} />
                    </button>
                    
                    <img
                      src={scannerPreviewUrl}
                      alt="scanned preview"
                      className="w-24 h-24 object-cover rounded-xl border border-white/10 shrink-0 bg-white/5"
                    />
                    
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-xs font-bold text-white truncate max-w-[240px]">{scannerImageFile?.name}</p>
                      <p className="text-[10px] text-purple-300 font-semibold font-mono mt-0.5">{(scannerImageFile?.size / 1024).toFixed(1)} KB</p>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <button
                          onClick={executeAIInvoiceScan}
                          disabled={scannerLoading}
                          className="bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-[10.5px] px-4 py-2 rounded-lg flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {scannerLoading ? (
                            <>
                              <Loader2 size={11} className="animate-spin" />
                              <span>Scanning Receipts...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw size={11} className="animate-pulse" />
                              <span>{isUr ? "ترجمہ اور اسکین کریں" : "Extract Shopping List"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Show Scan failures if applicable */}
              {scannerError && (
                <div className="text-red-300 bg-red-500/10 border border-red-500/20 text-[11px] p-3 rounded-xl flex items-start gap-1.5 text-left leading-relaxed">
                  <AlertCircle size={14} className="shrink-0 text-red-400 mt-0.5" />
                  <span>{scannerError}</span>
                </div>
              )}

              {/* SCAN RESULTS LIST */}
              {extractedDraft.length > 0 && (
                <div className="border border-white/10 rounded-xl p-4 bg-black/45 flex flex-col gap-3 animate-slide-in">
                  <h4 className="text-[11px] font-bold text-purple-300 uppercase tracking-widest flex items-center justify-between border-b border-white/10 pb-1.5">
                    <span>Draft Extraction Review</span>
                    <span className="text-white/40 font-mono text-[9px] lowercase font-normal">{extractedDraft.length} lines listed</span>
                  </h4>

                  <div className="max-h-[300px] overflow-y-auto flex flex-col gap-4 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                    
                    {/* Available section */}
                    {extractedDraft.some(item => item.matched) && (
                      <div className="flex flex-col gap-1.5">
                        <h5 className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          <span>{isUr ? "دستیاب مصنوعات" : "Available Products"}</span>
                        </h5>
                        {extractedDraft
                          .map((item, originalIndex) => ({ ...item, originalIndex }))
                          .filter(item => item.matched)
                          .map((item) => (
                            <div 
                              key={`scan-avail-${item.originalIndex}`} 
                              className="flex items-center gap-2 border border-green-500/20 bg-green-500/5 hover:border-green-500/35 shadow-sm shadow-green-500/5 p-2 rounded-xl justify-between select-none transition-all duration-350"
                            >
                              <div className="flex-1 grid grid-cols-12 gap-1.5 items-center">
                                {/* Name input with status-colored border */}
                                <div className="col-span-5 relative flex items-center">
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateDraftRow(item.originalIndex, "name", e.target.value)}
                                    placeholder="Product title"
                                    className="bg-slate-950/40 border border-green-500/20 focus:border-green-500 rounded px-1.5 py-1 text-white text-[11px] outline-none h-7 w-full pr-10 truncate"
                                  />
                                  <span className="absolute right-1 px-1 rounded text-[7px] font-bold tracking-tight uppercase bg-green-500/25 text-green-300">
                                    {isUr ? "کیٹلاگ" : "match"}
                                  </span>
                                </div>

                                {/* Urdu Name input */}
                                <input
                                  type="text"
                                  value={item.nameUr}
                                  onChange={(e) => updateDraftRow(item.originalIndex, "nameUr", e.target.value)}
                                  placeholder="Urdu title"
                                  className="bg-slate-950/40 border border-white/10 rounded px-1.5 py-1 text-white text-[11px] text-right outline-none h-7 col-span-4"
                                />
                                {/* Qty control */}
                                <div className="col-span-3 flex items-center border border-white/10 bg-slate-950/40 rounded h-7">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newQty = Math.max(1, item.qty - 1);
                                      updateDraftRow(item.originalIndex, "qty", newQty);
                                    }}
                                    className="px-1 text-xs text-white/50 hover:bg-white/5 flex-1 cursor-pointer h-full border-r border-white/10 font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="text-[10px] font-mono text-center w-5 text-white font-bold">{item.qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newQty = item.qty + 1;
                                      updateDraftRow(item.originalIndex, "qty", newQty);
                                    }}
                                    className="px-1 text-xs text-white/50 hover:bg-white/5 flex-1 cursor-pointer h-full border-l border-white/10 font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Price & Trash row actions */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <div className="flex items-center bg-slate-950/30 border border-white/10 rounded h-7 px-1 w-14" title={`Original base price: ${item.price} ${item.currencyCode || "PKR"}`}>
                                  <span className="text-[9px] text-white/40 font-mono">{EXCHANGE_RATES[currency]?.symbol || "$"}</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={Number(convertPrice(item.price, item.currencyCode || "USD", currency).toFixed(2))}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      const updatedBasePrice = convertPrice(val, currency, item.currencyCode || "USD");
                                      updateDraftRow(item.originalIndex, "price", updatedBasePrice);
                                    }}
                                    className="bg-transparent border-none text-white text-[10px] w-full font-mono outline-none p-0 text-center"
                                  />
                                </div>

                                <button
                                  onClick={() => removeDraftRow(item.originalIndex)}
                                  className="p-1 text-white/45 hover:text-red-400 hover:bg-red-500/15 rounded transition border border-transparent hover:border-red-500/10 cursor-pointer shrink-0"
                                  title="Remove row"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Unavailable section */}
                    {extractedDraft.some(item => !item.matched) && (
                      <div className="flex flex-col gap-1.5">
                        <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                          <span>{isUr ? "غیر دستیاب مصنوعات" : "Unavailable Products"}</span>
                        </h5>
                        {extractedDraft
                          .map((item, originalIndex) => ({ ...item, originalIndex }))
                          .filter(item => !item.matched)
                          .map((item) => (
                            <div 
                              key={`scan-unavail-${item.originalIndex}`} 
                              className="flex items-center gap-2 border border-red-500/25 bg-red-500/5 hover:border-red-500/40 shadow-sm shadow-red-500/5 p-2 rounded-xl justify-between select-none transition-all duration-350 animate-pulse"
                            >
                              <div className="flex-1 grid grid-cols-12 gap-1.5 items-center">
                                {/* Name input with status-colored border */}
                                <div className="col-span-6 relative flex items-center">
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateDraftRow(item.originalIndex, "name", e.target.value)}
                                    placeholder="Product title"
                                    className="bg-slate-950/40 border border-red-500/20 focus:border-red-500 rounded px-1.5 py-1 text-white text-[11px] outline-none h-7 w-full pr-10 truncate"
                                  />
                                  <span className="absolute right-1 px-1 rounded text-[7px] font-bold tracking-tight uppercase bg-red-500/25 text-red-300">
                                    {isUr ? "غیر دستیاب" : "Unavailable"}
                                  </span>
                                </div>

                                {/* Urdu Name input */}
                                <input
                                  type="text"
                                  value={item.nameUr}
                                  onChange={(e) => updateDraftRow(item.originalIndex, "nameUr", e.target.value)}
                                  placeholder="Urdu title"
                                  className="bg-slate-950/40 border border-white/10 rounded px-1.5 py-1 text-white text-[11px] text-right outline-none h-7 col-span-6"
                                />
                              </div>

                              {/* Only Trash action and Unavailable Label, NO Price input or Qty control */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="font-bold text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 select-none">
                                  {isUr ? "غیر دستیاب" : "Unavailable"}
                                </span>
                                <button
                                  onClick={() => removeDraftRow(item.originalIndex)}
                                  className="p-1 text-white/45 hover:text-red-400 hover:bg-red-500/15 rounded transition border border-transparent hover:border-red-500/10 cursor-pointer shrink-0"
                                  title="Remove row"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                  </div>

                  {/* Inline manual addition inside parsed catalog */}
                  <form onSubmit={addScannerManualItemSubmit} className="flex gap-1.5 mt-1 border-t border-white/5 pt-2 flex-wrap sm:flex-nowrap">
                    <input
                      type="text"
                      placeholder="Add missing product..."
                      required
                      value={scannerManualInput.name}
                      onChange={(e) => setScannerManualInput({ ...scannerManualInput, name: e.target.value })}
                      className="bg-white/5 text-white border border-white/10 rounded-lg px-2 py-1 text-[11px] outline-none flex-1 focus:border-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="کسٹم اردو ترجمہ..."
                      value={scannerManualInput.nameUr}
                      onChange={(e) => setScannerManualInput({ ...scannerManualInput, nameUr: e.target.value })}
                      className="bg-white/5 text-white border border-white/10 rounded-lg px-2 py-1 text-[11px] text-right font-medium outline-none flex-1 focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      className="bg-purple-500 hover:bg-purple-400 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-lg shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Plus size={11} />
                      <span>{isUr ? "شامل کریں" : "Add Row"}</span>
                    </button>
                  </form>

                  {/* Bulk approve to cart */}
                  <button
                    onClick={handleAddScannerItemsToCart}
                    className="w-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-purple-500/10 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Check size={14} className="stroke-[3]" />
                    <span>{isUr ? "تائید و کارٹ میں شامل کریں" : "Approve & Bulk Add Scanned Items to Cart"}</span>
                  </button>
                </div>
              )}

            </div>
          )}
          
        </div>

        {/* ==================== RIGHT DIAGNOSTICS LOGS MODULE ==================== */}
        <div className="lg:col-span-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-[520px]">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
              <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                <span className="text-purple-400">⚙️</span>
                <span>{t.transcriptHeading}</span>
              </h3>
              
              {/* CLEAR VOICE LOGS / ACTION HISTORY UTILITY CHAT CLEANUP FEATURE */}
              {logs.length > 0 && (
                <button
                  onClick={onClearLogs}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/25 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0 uppercase tracking-wide"
                  title="Clear voice processing history logs"
                  id="btn-clear-logs"
                >
                  <Trash2 size={11} />
                  <span>{isUr ? "صاف کریں" : "Clear Logs"}</span>
                </button>
              )}
            </div>

            <p className="text-xs text-white/40 mb-4 h-8 overflow-hidden leading-snug">
              {isUr 
                ? "یہاں صوتی پروسیسنگ اور آرڈر سکینر کے تفصیلی آڈٹ لاگز ریئل ٹائم میں ظاہر ہوتے ہیں۔"
                : "Provides strict visibility tracking semantic speech recognition and AI scanner results."}
            </p>

            <div className="bg-slate-950/45 rounded-xl p-4 h-[350px] overflow-y-auto font-mono text-[11px] text-white/70 border border-white/5 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-white/10">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-white/30 px-4 select-none">
                  <AlertCircle size={32} className="mb-2 text-white/10 animate-bounce" />
                  <p>{t.noTranscript}</p>
                  <p className="text-[10px] text-white/20 mt-1 max-w-[190px]">Use the voice assistant or bill scanner to populate events.</p>
                </div>
              ) : (
                logs.filter(log => {
                  const lowercaseLog = log.toLowerCase();
                  if (lowercaseLog.includes("gemini") || 
                      lowercaseLog.includes("analyzing") || 
                      lowercaseLog.includes("scanning") || 
                      lowercaseLog.includes("identified") || 
                      lowercaseLog.includes("marked as unavailable") ||
                      lowercaseLog.includes("not found in") ||
                      lowercaseLog.includes("successfully added to catalogue") ||
                      lowercaseLog.includes("to parse") ||
                      lowercaseLog.includes("تجزیہ") ||
                      lowercaseLog.includes("شناخت") ||
                      lowercaseLog.includes("اسکین") ||
                      lowercaseLog.includes("سیکنڈوں") ||
                      lowercaseLog.includes("کامیابی سے شامل")) {
                    return false;
                  }
                  return true;
                }).map((log, index) => {
                  const isSuccess = log.includes("Successfully") || log.includes("Identified");
                  const isInput = log.includes("keyed in") || log.includes("from voice");
                  const isScanner = log.includes("scanned") || log.includes("invoice");

                  return (
                    <div 
                      key={index} 
                      className={`p-2.5 rounded-xl leading-relaxed border ${
                        isSuccess 
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" 
                          : isInput 
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/20" 
                            : isScanner
                              ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                              : "bg-white/5 border-white/5 text-white/65"
                      }`}
                    >
                      <div className="flex items-start gap-1.5 text-left">
                        {isSuccess ? (
                          <CornerDownRight size={12} className="text-emerald-400 mt-1 shrink-0" />
                        ) : (
                          <ChevronRight size={12} className="text-white/30 mt-1 shrink-0" />
                        )}
                        <span className="break-all">{log}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
