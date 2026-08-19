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
  ChevronDown,
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
  RefreshCw,
  ShoppingCart,
  Camera,
  CameraOff,
  Zap,
  ZapOff,
  RotateCcw,
  Image as ImageIcon,
  Scan,
  Maximize2
} from "lucide-react";
import { api } from "../utils/api";
import { matchProductFuzzy } from "../utils/productMatcher";
import { findMatchingRecipe } from "../recipes_db";

// 100 Complete Pakistani & International Dishes for Recipe Directory
const VOICE_ASSISTANT_100_RECIPES = [
  { name: "Chicken Biryani", nameUr: "چکن بریانی", icon: "🍲", query: "Biryani recipe" },
  { name: "Beef Biryani", nameUr: "بیف بریانی", icon: "🍲", query: "Beef Biryani recipe" },
  { name: "Mutton Biryani", nameUr: "مٹن بریانی", icon: "🍲", query: "Mutton Biryani recipe" },
  { name: "Sindhi Biryani", nameUr: "سندھی بریانی", icon: "🍲", query: "Sindhi Biryani recipe" },
  { name: "Hyderabadi Biryani", nameUr: "حیدرآبادی بریانی", icon: "🍲", query: "Hyderabadi Biryani recipe" },
  { name: "Beef Haleem", nameUr: "بیف حلیم", icon: "🍛", query: "Haleem recipe" },
  { name: "Chicken Haleem", nameUr: "چکن حلیم", icon: "🍛", query: "Chicken Haleem recipe" },
  { name: "Chicken Karahi", nameUr: "چکن کڑاہی", icon: "🥘", query: "Chicken Karahi recipe" },
  { name: "Mutton Karahi", nameUr: "مٹن کڑاہی", icon: "🥘", query: "Mutton Karahi recipe" },
  { name: "White Chicken Karahi", nameUr: "وائٹ چکن کڑاہی", icon: "🥘", query: "White Chicken Karahi recipe" },
  { name: "Balochi Tikka Karahi", nameUr: "بلوچی تکہ کڑاہی", icon: "🥘", query: "Balochi Tikka Karahi recipe" },
  { name: "Shinwari Mutton Karahi", nameUr: "شنواری مٹن کڑاہی", icon: "🥘", query: "Shinwari Karahi recipe" },
  { name: "Beef Nihari", nameUr: "بیف نہاری", icon: "🍲", query: "Beef Nihari recipe" },
  { name: "Nalli Nihari", nameUr: "نلی نہاری", icon: "🍲", query: "Nalli Nihari recipe" },
  { name: "Chicken Handi", nameUr: "چکن ہانڈی", icon: "🍲", query: "Chicken Handi recipe" },
  { name: "Chicken Makhni Handi", nameUr: "چکن مکھنی ہانڈی", icon: "🍲", query: "Makhni Handi recipe" },
  { name: "Chicken Tikka", nameUr: "چکن تکہ", icon: "🍢", query: "Chicken Tikka recipe" },
  { name: "Seekh Kabab", nameUr: "سیخ کباب", icon: "🍢", query: "Seekh Kabab recipe" },
  { name: "Chapli Kabab", nameUr: "چپلی کباب", icon: "🧆", query: "Chapli Kabab recipe" },
  { name: "Malai Boti", nameUr: "ملائی بوٹی", icon: "🍢", query: "Malai Boti recipe" },
  { name: "Reshmi Kabab", nameUr: "ریشمی کباب", icon: "🍢", query: "Reshmi Kabab recipe" },
  { name: "Chicken Bihari Kabab", nameUr: "چکن بہاری کباب", icon: "🍢", query: "Bihari Kabab recipe" },
  { name: "Halwa Puri Chana", nameUr: "حلوہ پوری چنا", icon: "🫓", query: "Halwa Puri recipe" },
  { name: "Daal Chawal", nameUr: "دال چاول", icon: "🍚", query: "Daal Chawal recipe" },
  { name: "Daal Mash Fry", nameUr: "دال ماش فرائی", icon: "🍲", query: "Daal Mash recipe" },
  { name: "Daal Tadka / Yellow Daal", nameUr: "دال تڑکہ", icon: "🍲", query: "Daal Tadka recipe" },
  { name: "Aloo Palak", nameUr: "آلو پالک", icon: "🥬", query: "Aloo Palak recipe" },
  { name: "Palak Paneer", nameUr: "پالک پنیر", icon: "🧀", query: "Palak Paneer recipe" },
  { name: "Sarson Ka Saag", nameUr: "سرسوں کا ساگ", icon: "🥬", query: "Sarson Ka Saag recipe" },
  { name: "Bhindi Masala", nameUr: "بھنڈی مصالحہ", icon: "🫛", query: "Bhindi Masala recipe" },
  { name: "Mix Sabzi", nameUr: "مکس سبزی", icon: "🥗", query: "Mix Sabzi recipe" },
  { name: "Aloo Gobi", nameUr: "آلو گوبھی", icon: "🥦", query: "Aloo Gobi recipe" },
  { name: "Aloo Matar", nameUr: "آلو مٹر", icon: "🫛", query: "Aloo Matar recipe" },
  { name: "Aloo Baingan", nameUr: "آلو بینگن", icon: "🍆", query: "Aloo Baingan recipe" },
  { name: "Baingan Bharta", nameUr: "بیگن کا بھرتہ", icon: "🍆", query: "Baingan Bharta recipe" },
  { name: "Chana Chaat", nameUr: "چنا چاٹ", icon: "🥗", query: "Chana Chaat recipe" },
  { name: "Dahi Bhalle", nameUr: "دہی بھلے", icon: "🥣", query: "Dahi Bhalle recipe" },
  { name: "Samosa Chaat", nameUr: "سموسہ چاٹ", icon: "🥟", query: "Samosa Chaat recipe" },
  { name: "Gol Gappay / Pani Puri", nameUr: "گول گپے", icon: "🥣", query: "Gol Gappay recipe" },
  { name: "Bun Kabab", nameUr: "بن کباب", icon: "🍔", query: "Bun Kabab recipe" },
  { name: "Beef Paya", nameUr: "بیف پائے", icon: "🍲", query: "Beef Paya recipe" },
  { name: "Mutton Paya", nameUr: "مٹن پائے", icon: "🍲", query: "Mutton Paya recipe" },
  { name: "Chicken Sajji", nameUr: "چکن سجی", icon: "🍗", query: "Chicken Sajji recipe" },
  { name: "Chicken Yakhni Pulao", nameUr: "چکن یخنی پلاؤ", icon: "🍚", query: "Chicken Yakhni Pulao recipe" },
  { name: "Beef Pulao", nameUr: "بیف پلاؤ", icon: "🍚", query: "Beef Pulao recipe" },
  { name: "Kabuli Pulao", nameUr: "کابلی پلاؤ", icon: "🍚", query: "Kabuli Pulao recipe" },
  { name: "Matar Pulao", nameUr: "مٹر پلاؤ", icon: "🍚", query: "Matar Pulao recipe" },
  { name: "Chicken Korma", nameUr: "چکن قورمہ", icon: "🍲", query: "Chicken Korma recipe" },
  { name: "Mutton Korma", nameUr: "مٹن قورمہ", icon: "🍲", query: "Mutton Korma recipe" },
  { name: "Shahi Chicken Korma", nameUr: "شاہی چکن قورمہ", icon: "🍲", query: "Shahi Korma recipe" },
  { name: "Lahori Fish Fry", nameUr: "لاہوری فش فرائی", icon: "🐟", query: "Fish Fry recipe" },
  { name: "Grilled Fish", nameUr: "گریلڈ فش", icon: "🐟", query: "Grilled Fish recipe" },
  { name: "Prawn Karahi / Curry", nameUr: "پراؤن کڑاہی", icon: "🍤", query: "Prawn Curry recipe" },
  { name: "Shami Kabab", nameUr: "شامی کباب", icon: "🧆", query: "Shami Kabab recipe" },
  { name: "Gola Kabab", nameUr: "گولہ کباب", icon: "🍢", query: "Gola Kabab recipe" },
  { name: "Egg Fried Rice", nameUr: "ایگ فرائیڈ رائس", icon: "🍚", query: "Egg Fried Rice recipe" },
  { name: "Chicken Fried Rice", nameUr: "چکن فرائیڈ رائس", icon: "🍚", query: "Chicken Fried Rice recipe" },
  { name: "Chicken Chow Mein", nameUr: "چکن چوؤ مین", icon: "🍜", query: "Chicken Chow Mein recipe" },
  { name: "Chicken Manchurian", nameUr: "چکن منچورین", icon: "🍲", query: "Chicken Manchurian recipe" },
  { name: "Chicken Shashlik", nameUr: "چکن شاشلک", icon: "🍢", query: "Chicken Shashlik recipe" },
  { name: "Alfredo Pasta", nameUr: "الفریڈو پاستا", icon: "🍝", query: "Alfredo Pasta recipe" },
  { name: "Spaghetti Carbonara", nameUr: "اسپیگیٹی کاربونارا", icon: "🍝", query: "Spaghetti Carbonara recipe" },
  { name: "Bolognese Spaghetti", nameUr: "بولوگنیز اسپیگیٹی", icon: "🍝", query: "Spaghetti Bolognese recipe" },
  { name: "Creamy Chicken Pasta", nameUr: "کریمی چکن پاستا", icon: "🍝", query: "Chicken Pasta recipe" },
  { name: "Penne Arrabbiata", nameUr: "پینے ارابیتا", icon: "🍝", query: "Penne Arrabbiata recipe" },
  { name: "Chicken Lasagna", nameUr: "چکن لازانیا", icon: "🧀", query: "Chicken Lasagna recipe" },
  { name: "Beef Lasagna", nameUr: "بیف لازانیا", icon: "🧀", query: "Beef Lasagna recipe" },
  { name: "Pepperoni Pizza", nameUr: "پیپرونی پیزا", icon: "🍕", query: "Pepperoni Pizza recipe" },
  { name: "Chicken Tikka Pizza", nameUr: "چکن تکہ پیزا", icon: "🍕", query: "Chicken Tikka Pizza recipe" },
  { name: "Margherita Pizza", nameUr: "مارگریٹا پیزا", icon: "🍕", query: "Pizza recipe" },
  { name: "Zinger Burger", nameUr: "زنگر برگر", icon: "🍔", query: "Zinger Burger recipe" },
  { name: "Beef Smash Burger", nameUr: "بیف برگر", icon: "🍔", query: "Beef Burger recipe" },
  { name: "Grilled Chicken Sandwich", nameUr: "گریلڈ چکن سینڈوچ", icon: "🥪", query: "Chicken Sandwich recipe" },
  { name: "Club Sandwich", nameUr: "کلب سینڈوچ", icon: "🥪", query: "Club Sandwich recipe" },
  { name: "Mexican Tacos", nameUr: "میکسیکن ٹیکوز", icon: "🌮", query: "Mexican Tacos recipe" },
  { name: "Beef Burrito", nameUr: "بیف بوریٹو", icon: "🌯", query: "Burrito recipe" },
  { name: "Chicken Quesadilla", nameUr: "کیسادیلا", icon: "🌮", query: "Quesadilla recipe" },
  { name: "Japanese Ramen", nameUr: "جاپانی رامن", icon: "🍜", query: "Ramen recipe" },
  { name: "Chicken Teriyaki Rice", nameUr: "چکن تیرییاکی", icon: "🍚", query: "Chicken Teriyaki recipe" },
  { name: "Shakshuka", nameUr: "شکشوقہ", icon: "🍳", query: "Shakshuka recipe" },
  { name: "Chicken Shawarma", nameUr: "چکن شوارما", icon: "🌯", query: "Chicken Shawarma recipe" },
  { name: "Falafel Wrap", nameUr: "فلافل ریپ", icon: "🧆", query: "Falafel recipe" },
  { name: "Hummus & Pita", nameUr: "حمص اور پیٹا", icon: "🫓", query: "Hummus recipe" },
  { name: "Butter Chicken / Makhni", nameUr: "بٹر چکن", icon: "🧈", query: "Butter Chicken recipe" },
  { name: "Chicken Tikka Masala", nameUr: "چکن تکہ مصالحہ", icon: "🥘", query: "Chicken Tikka Masala recipe" },
  { name: "Kheer / Rice Pudding", nameUr: "کھیر", icon: "🥣", query: "Kheer recipe" },
  { name: "Firni", nameUr: "فرنی", icon: "🥣", query: "Firni recipe" },
  { name: "Shahi Tukday", nameUr: "شاہی ٹکڑے", icon: "🍞", query: "Shahi Tukday recipe" },
  { name: "Gulab Jamun", nameUr: "گلاب جامن", icon: "🍡", query: "Gulab Jamun recipe" },
  { name: "Rasmalai", nameUr: "رس ملائی", icon: "🥛", query: "Rasmalai recipe" },
  { name: "Gajar Ka Halwa", nameUr: "گاجر کا حلوہ", icon: "🥕", query: "Gajar Ka Halwa recipe" },
  { name: "Sooji Ka Halwa", nameUr: "سوجی کا حلوہ", icon: "🥣", query: "Sooji Halwa recipe" },
  { name: "Lab-e-Shireen", nameUr: "لب شیریں", icon: "🍧", query: "Lab-e-Shireen recipe" },
  { name: "Zarda / Meethe Chawal", nameUr: "زردہ", icon: "🍚", query: "Zarda recipe" },
  { name: "Mutanjan", nameUr: "متنجن", icon: "🍚", query: "Mutanjan recipe" },
  { name: "Custard Trifle", nameUr: "کسٹرڈ ٹرائفل", icon: "🍨", query: "Custard Trifle recipe" },
  { name: "Pakora & Samosa Mix", nameUr: "پکوڑے اور سموسے", icon: "🥟", query: "Pakora Samosa recipe" },
  { name: "Chicken Bread / Roll", nameUr: "چکن بریڈ / رول", icon: "🥐", query: "Chicken Roll recipe" },
  { name: "Pakistani Chai / Doodh Patti", nameUr: "چائے / دودھ پتی", icon: "☕", query: "Chai recipe" },
  { name: "Mango Lassi", nameUr: "عام کی لسی", icon: "🥭", query: "Mango Lassi recipe" }
];


const speakText = (text, language = "en") => {
  // Voice output audio is completely disabled
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
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
  const [activeRecipeTitle, setActiveRecipeTitle] = useState(null);
  const [manualVoiceInput, setManualVoiceInput] = useState("");

  const handleAddManualVoiceProduct = () => {
    if (!manualVoiceInput || !manualVoiceInput.trim()) return;
    const term = manualVoiceInput.trim();
    const queryLower = term.toLowerCase();

    let match = products.find(p => 
      p.name.toLowerCase() === queryLower || 
      (p.nameUr && p.nameUr.toLowerCase() === queryLower)
    );
    if (!match) {
      match = matchProductFuzzy(term, term, products);
    }
    if (!match) {
      match = products.find(p => 
        p.name.toLowerCase().includes(queryLower) || 
        (p.nameUr && p.nameUr.includes(queryLower)) ||
        queryLower.includes(p.name.toLowerCase())
      );
    }

    const price = match ? ((match.salePrice && match.salePrice > 0) ? match.salePrice : match.price) : 250;
    const itemUnit = match ? match.unit : "kg";
    const itemUnitUr = match ? match.unitUr : "کلو";

    const newProduct = {
      productId: match ? match.id : null,
      name: match ? match.name : term,
      nameUr: match ? match.nameUr : term,
      qty: 1,
      unit: itemUnit,
      unitUr: itemUnitUr,
      price: match ? price : 0,
      category: match ? match.category : "Unavailable",
      currencyCode: match ? (match.currencyCode || match.currency || "PKR") : "PKR",
      matched: !!match,
      action: "add"
    };

    setVoiceDraftList(prev => [...prev, newProduct]);
    setManualVoiceInput("");
    if (match) {
      onNotify(isUr ? `"${newProduct.nameUr}" فہرست کا جائزہ میں شامل ہو گئی۔` : `Added "${newProduct.name}" to review list. Click 'Add to Cart' to add to cart.`, "info");
      addLog(`Added '${newProduct.name}' to draft review list.`);
    } else {
      onNotify(isUr ? `"${term}" غیر دستیاب ہے اور لسٹ کے جائزہ میں شامل کی گئی۔` : `"${term}" is unavailable in store catalog. Listed in draft review.`, "warning");
      addLog(`'${term}' marked as unavailable and added to draft review.`);
    }
  };


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
    setActiveRecipeTitle(null);
    setRecipeCard(null);
    setCustomText("");
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
        qty: item.qty || 1,
        action: "add"
      }));

    if (resolvedItems.length > 0) {
      onAddItems(resolvedItems);
      onNotify(isUr ? "اشیاء کامیابی سے کارٹ میں شامل کر دی گئیں۔" : "Successfully added items to your cart!", "success");
      addLog(`Voice list bulk additions of ${resolvedItems.length} items synced to cart.`);
      setVoiceDraftList([]);
      setActiveRecipeTitle(null);
      setRecipeCard(null);
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
  const [scannerSubMode, setScannerSubMode] = useState("upload"); // 'upload' | 'list'
  const [scannerImageFile, setScannerImageFile] = useState(null);
  const [scannerPreviewUrl, setScannerPreviewUrl] = useState(null);
  const [scannerBase64, setScannerBase64] = useState(null);
  const [scannerMimeType, setScannerMimeType] = useState("image/jpeg");
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [extractedDraft, setExtractedDraft] = useState([]); // Array of items extracted from invoice scan
  const [selectedListText, setSelectedListText] = useState("");
  const [customListName, setCustomListName] = useState("");
  const [customListItems, setCustomListItems] = useState("");
  const [showCustomListModal, setShowCustomListModal] = useState(false);

  // Live Camera Scanner State
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const [cameraError, setCameraError] = useState("");
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [hasTorchSupport, setHasTorchSupport] = useState(false);

  // Automatic clean stop of camera stream on unmount or mode switch
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        try {
          cameraStreamRef.current.getTracks().forEach(t => t.stop());
        } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    if (activeMode === "scanner" && scannerSubMode === "camera" && !scannerPreviewUrl && !isCameraActive) {
      startCamera("environment");
    } else if (activeMode !== "scanner" || scannerSubMode !== "camera" || scannerPreviewUrl) {
      stopCamera();
    }
  }, [activeMode, scannerSubMode, scannerPreviewUrl]);

  const [savedProductLists, setSavedProductLists] = useState(() => {
    try {
      const stored = localStorage.getItem("voxcart_saved_product_lists");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error reading saved product lists:", e);
    }
    return [
      {
        id: "weekly_ration",
        name: "Weekly Essentials",
        nameUr: "ہفتہ وار ضروری راشن",
        icon: "🛒",
        items: "2L Whole Milk, 1 Dozen Large Eggs, 5kg Basmati Rice, 2L Cooking Oil, 2kg White Sugar, 1 Pack Iodized Salt, 2kg Brown Onions, 2kg Fresh Potatoes, 1kg Red Tomatoes, 1 Pack Tea"
      },
      {
        id: "ramadan_iftar",
        name: "Ramadan & Iftar Basket",
        nameUr: "رمضان و افطار راشن",
        icon: "🌙",
        items: "1kg Premium Dates, 1 Bottle Rooh Afza, 1kg Gram Flour / Besan, 3L Cooking Oil, 1 Pack Chaat Masala, 1kg White Chickpeas, 2kg White Sugar, 2L Whole Milk"
      },
      {
        id: "breakfast_dairy",
        name: "Breakfast & Dairy",
        nameUr: "صبح کا ناشتہ و ڈیری",
        icon: "🍳",
        items: "2L Whole Milk, 1 Dozen Large Eggs, 1 Pack Sandwich Bread, 1 Pack Butter, 1 Pack Cheddar Cheese, 1 Box Green Tea"
      },
      {
        id: "dinner_biryani",
        name: "Dinner & Biryani Feast",
        nameUr: "دعوت و بریانی لسٹ",
        icon: "🍗",
        items: "2kg Chicken Breast, 2kg Basmati Rice, 1L Cooking Oil, 2 Pack Biryani Masala, 1kg Fresh Yogurt, 1kg Brown Onions, 1kg Red Tomatoes"
      },
      {
        id: "cleaning_home",
        name: "Household & Cleaning",
        nameUr: "گھریلو صفائی کا سامان",
        icon: "🧼",
        items: "1 Bottle Dishwashing Liquid, 1 Pack Laundry Detergent, 1 Bottle Hand Wash, 2 Pack Tissue Box"
      }
    ];
  });

  const handleSaveCustomList = () => {
    if (!customListName.trim() || !customListItems.trim()) {
      onNotify(isUr ? "براہ کرم لسٹ کا نام اور پروڈکٹس درج کریں۔" : "Please provide a list name and products.", "warning");
      return;
    }
    const newList = {
      id: "custom_" + Date.now(),
      name: customListName.trim(),
      nameUr: customListName.trim(),
      icon: "📋",
      items: customListItems.trim()
    };
    const updated = [newList, ...savedProductLists];
    setSavedProductLists(updated);
    try {
      localStorage.setItem("voxcart_saved_product_lists", JSON.stringify(updated));
    } catch (e) {}
    setSelectedListText(newList.items);
    setCustomListName("");
    setCustomListItems("");
    setShowCustomListModal(false);
    onNotify(isUr ? `نئی لسٹ "${newList.name}" کامیابی سے محفوظ ہو گئی!` : `Saved list "${newList.name}"!`, "success");
  };

  const handleDeleteCustomList = (listId, e) => {
    if (e) e.stopPropagation();
    const updated = savedProductLists.filter(l => l.id !== listId);
    setSavedProductLists(updated);
    try {
      localStorage.setItem("voxcart_saved_product_lists", JSON.stringify(updated));
    } catch (e) {}
    onNotify(isUr ? "لسٹ حذف کر دی گئی۔" : "List removed.", "info");
  };

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

  // Helper to process recipe presentation with strict availability checking, UI updates, and voice communication
  const processRecipePresentation = (recipeObj, rawTitle = "") => {
    const latestProducts = [...(productsRef.current || products || [])];
    const recTitle = isUr 
      ? (recipeObj.nameUr || recipeObj.nameEn || recipeObj.recipeNameUr || recipeObj.recipeName || rawTitle)
      : (recipeObj.nameEn || recipeObj.nameUr || recipeObj.recipeName || recipeObj.recipeNameUr || rawTitle);

    setActiveRecipeTitle(recTitle);

    const rawIngs = recipeObj.ingredients || recipeObj.recipeIngredients || [];
    const processedDraft = rawIngs.map((ing, idx) => {
      let match = null;
      if (ing.productId || ing.matchedProductId) {
        const pId = String(ing.productId || ing.matchedProductId);
        match = latestProducts.find(p => String(p.id) === pId);
      }
      if (!match && (ing.name || ing.en)) {
        match = matchProductFuzzy(ing.name || ing.en, ing.nameUr || ing.ur, latestProducts);
      }

      const isAvailable = !!(
        match &&
        match.status !== "Inactive" &&
        match.status !== "Unavailable" &&
        (match.stockQuantity === undefined || match.stockQuantity > 0) &&
        match.price > 0 &&
        ing.matched !== false
      );

      let itemQty = typeof ing.qty === "number" && ing.qty > 0 ? ing.qty : (parseFloat(ing.qty) || 1);
      if (itemQty <= 0) itemQty = 1;

      return {
        productId: isAvailable ? match.id : ("unavail_recipe_" + idx + "_" + Math.random().toString(36).substring(2, 7)),
        qty: itemQty,
        action: "set",
        name: isAvailable && match ? match.name : (ing.name || ing.en || "Custom Ingredient"),
        nameUr: isAvailable && match ? (match.nameUr || ing.nameUr || ing.ur || match.name) : (ing.nameUr || ing.ur || ing.name || "غیر دستیاب جزو"),
        price: isAvailable && match ? ((match.salePrice && match.salePrice > 0) ? match.salePrice : match.price) : 0,
        category: isAvailable && match ? match.category : "Unavailable",
        unit: isAvailable && match ? (match.unit || ing.unit || "pack") : (ing.unit || "pack"),
        unitUr: isAvailable && match ? (match.unitUr || ing.unitUr || "پیکٹ") : (ing.unitUr || "پیکٹ"),
        matched: isAvailable,
        currencyCode: isAvailable && match ? (match.currencyCode || match.currency || "PKR") : "PKR"
      };
    });

    const fullRecipeCard = {
      nameEn: recipeObj.nameEn || recipeObj.recipeName || recTitle,
      nameUr: recipeObj.nameUr || recipeObj.recipeNameUr || recTitle,
      category: recipeObj.category || "Main Course",
      prepTime: recipeObj.prepTime || "15 mins",
      cookTime: recipeObj.cookTime || "30 mins",
      servings: recipeObj.servings || "4 persons",
      difficulty: recipeObj.difficulty || "Medium",
      calories: recipeObj.calories || "450 kcal",
      descriptionEn: recipeObj.descriptionEn || (isUr ? "" : `Ingredients breakdown for ${recTitle}.`),
      descriptionUr: recipeObj.descriptionUr || (isUr ? `${recTitle} کے لیے درکار اجزاء کی تفصیل۔` : ""),
      ingredients: processedDraft.map(item => ({
        productId: item.matched ? item.productId : null,
        name: item.name,
        nameUr: item.nameUr,
        qty: item.qty,
        unit: item.unit,
        unitUr: item.unitUr,
        matched: item.matched,
        price: item.price,
        currencyCode: item.currencyCode,
        category: item.category
      })),
      instructionsEn: recipeObj.instructionsEn || recipeObj.stepsEn || [
        "Review the required grocery ingredients in the list below.",
        "Add available ingredients to cart with 1 click."
      ],
      instructionsUr: recipeObj.instructionsUr || recipeObj.stepsUr || [
        "نیچے دی گئی فہرست میں تمام درکار اجزاء چیک کریں۔",
        "دستیاب اجزاء کو ایک کلک میں کارٹ میں شامل کریں۔"
      ]
    };

    setRecipeCard(fullRecipeCard);
    setVoiceDraftList(processedDraft);
    setTranscriptText("");
    transcriptTextRef.current = "";

    const availableItems = processedDraft.filter(i => i.matched);
    const unavailableItems = processedDraft.filter(i => !i.matched);
    const availCount = availableItems.length;
    const unavailCount = unavailableItems.length;
    const totalCount = processedDraft.length;

    const unavailNamesEn = unavailableItems.map(i => i.name).join(", ");
    const unavailNamesUr = unavailableItems.map(i => i.nameUr || i.name).join("، ");

    let displayMsg = "";
    let ttsVoiceMsg = "";

    if (unavailCount === 0) {
      displayMsg = isUr
        ? `ترکیب "${recTitle}" کے تمام ${totalCount} اجزاء حاصل ہو گئے اور اسٹور میں دستیاب ہیں!`
        : `Found recipe "${recTitle}"! All ${totalCount} required ingredients are available in store.`;
    } else if (availCount > 0) {
      displayMsg = isUr
        ? `ترکیب "${recTitle}" کے اجزاء: ${availCount} دستیاب، ${unavailCount} غیر دستیاب (${unavailNamesUr})۔`
        : `Found recipe "${recTitle}"! ${availCount} ingredients available, ${unavailCount} Unavailable: ${unavailNamesEn}.`;
    } else {
      displayMsg = isUr
        ? `ترکیب "${recTitle}" مل گئی ہے، لیکن تمام درکار اجزاء (${unavailNamesUr}) فی الحال غیر دستیاب ہیں۔`
        : `Found recipe "${recTitle}", but all required ingredients (${unavailNamesEn}) are currently Unavailable.`;
    }

    onNotify(displayMsg, unavailCount > 0 ? "warning" : "success");
    addLog(displayMsg);
  };

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

    addLog(isUr ? "صوتی آواز یا متن کا تجزیہ کیا جا رہا ہے..." : "Analyzing input for recipe & products...");

    try {
      const recipeKeywords = [
        "recipe", "how to cook", "how to make", "how to prepare", "steps for", "cooking guide", "ingredients for recipe",
        "ترکیب", "طریقہ", "پکانے کا طریقہ", "کیسے بنائیں", "کیسے پکائیں", "ریسیپی", "banane ka tarika", "kaise banaye", "kaise pakaye", "ki recipe", "ke ingredients", "ke ajza"
      ];
      const isExplicitRecipeRequest = recipeKeywords.some(kw => textToParse.toLowerCase().includes(kw));

      if (!isExplicitRecipeRequest) {
        // Prioritize parsing as direct products
        const result = await api.parseVoice(textToParse);
        if (result && Array.isArray(result) && result.length > 0) {
          setRecipeCard(null);
          setActiveRecipeTitle(null);

          const finalDraftItems = [];
          const latestProducts = [...(productsRef.current || products || [])];

          for (const item of result) {
            let match = item.productId ? latestProducts.find(p => String(p.id) === String(item.productId)) : null;
            if (!match) {
              match = matchProductFuzzy(item.name, item.nameUr, latestProducts);
            }

            const rawId = match ? match.id : (item.productId || ("custom_" + Math.random().toString(36).substring(2, 8)));
            const resolvedId = isNaN(Number(rawId)) ? rawId : Number(rawId);

            finalDraftItems.push({
              ...item,
              productId: resolvedId,
              name: match ? match.name : item.name,
              nameUr: match ? match.nameUr : item.nameUr,
              price: match ? ((match.salePrice && match.salePrice > 0) ? match.salePrice : match.price) : (item.price || 250),
              category: match ? match.category : (item.category || "Pantry"),
              unit: match ? match.unit : (item.unit || "kg"),
              unitUr: match ? match.unitUr : (item.unitUr || "کلو"),
              matched: !!match,
              currencyCode: match ? (match.currencyCode || match.currency || "PKR") : (currency || "PKR")
            });
          }

          setVoiceDraftList(finalDraftItems);
          setTranscriptText("");
          transcriptTextRef.current = "";

          const msg = isUr 
            ? `${finalDraftItems.length} پروڈکٹس کامیابی سے منتخب ہو گئیں۔`
            : `Added ${finalDraftItems.length} items to your product list!`;

          onNotify(msg, "success");
          addLog(msg);
          return;
        }
      }

      // 1. Check local recipe database for explicit recipe requests
      const localRecipe = findMatchingRecipe(textToParse.trim(), products || []);
      if (localRecipe) {
        processRecipePresentation(localRecipe, textToParse);
        return;
      }

      // 2. Try Smart Search to detect any other or custom recipes via Gemini
      let smartRes = null;
      try {
        smartRes = await api.smartSearch(textToParse.trim(), lang);
      } catch (sErr) {
        console.warn("Smart search attempt failed, proceeding to alternate parsing:", sErr);
      }

      if (smartRes && smartRes.type === "recipe" && Array.isArray(smartRes.recipeIngredients) && smartRes.recipeIngredients.length > 0) {
        processRecipePresentation(smartRes, textToParse);
        return;
      }

      // 3. Fallback: try the recipe database search endpoint
      let recipeRes = null;
      try {
        recipeRes = await api.searchRecipe(textToParse.trim(), lang, currency);
      } catch (rErr) {
        console.warn("Recipe search attempt failed:", rErr);
      }

      if (recipeRes && recipeRes.recipe && Array.isArray(recipeRes.recipe.ingredients) && recipeRes.recipe.ingredients.length > 0) {
        processRecipePresentation(recipeRes.recipe, textToParse);
        return;
      }

      // 4. Standard voice list parse for individual grocery items
      setActiveRecipeTitle(null);
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
          if (!match && item.name) {
            match = matchProductFuzzy(item.name, item.nameUr, latestProducts);
          }
          if (!match && item.name) {
            const lowerName = item.name.toLowerCase().trim();
            match = latestProducts.find(p => {
              const pName = (p.name || "").toLowerCase().trim();
              const pNameUr = (p.nameUr || "").toLowerCase().trim();
              return pName === lowerName || pNameUr === lowerName;
            });
          }

          const isMatched = !!(match && match.id && match.status !== "Inactive" && match.status !== "Unavailable");
          const resolvedId = isMatched ? (isNaN(Number(match.id)) ? match.id : Number(match.id)) : null;
          const itemName = isMatched ? match.name : (item.name || "Scanned Item");
          const itemNameUr = isMatched ? match.nameUr : (item.nameUr || itemName);
          const itemPrice = isMatched ? ((match.salePrice && match.salePrice > 0) ? match.salePrice : match.price) : 0;

          if (isMatched) {
            addLog(isUr ? `پروڈکٹ کی شناخت ہوئی: "${itemName}"` : `Identified product: "${itemName}"`);
          } else {
            addLog(isUr ? `پروڈکٹ غیر دستیاب ہے: "${itemName}"` : `Product unavailable in store: "${itemName}"`);
          }

          const draftItem = {
            ...item,
            name: itemName,
            nameUr: itemNameUr,
            price: itemPrice,
            category: isMatched ? match.category : "Unavailable",
            unit: isMatched ? match.unit : (item.unit || "item"),
            unitUr: isMatched ? match.unitUr : (item.unitUr || "عدد"),
            productId: resolvedId,
            matched: isMatched,
            currencyCode: isMatched ? (match.currencyCode || match.currency || "PKR") : "PKR"
          };
          finalDraftItems.push(draftItem);

          resolvedItems.push({
            productId: resolvedId,
            name: itemName,
            nameUr: itemNameUr,
            price: itemPrice,
            unit: draftItem.unit,
            unitUr: draftItem.unitUr,
            currencyCode: draftItem.currencyCode,
            qty: Math.max(1, Math.round(parseFloat(draftItem.qty) || 1)),
            action: item.action || "add"
          });
        }

        if (onRefreshProducts && resolvedItems.length > 0) {
          await onRefreshProducts();
        }

        setVoiceDraftList(finalDraftItems);

        setTranscriptText("");
        transcriptTextRef.current = "";

        if (resolvedItems.length > 0) {
          onNotify(
            isUr 
              ? `لسٹ اور صوتی تجزیہ مکمل ہو گیا۔ ${resolvedItems.length} اشیاء ملی۔ کارٹ میں شامل کرنے کے لیے 'Add to Cart' پر کلک کریں۔`
              : `List parsed successfully! Found ${resolvedItems.length} items. Click 'Add to Cart' to add them to cart.`,
            "success"
          );
          addLog(isUr ? `صوتی لسٹ تجزیہ مکمل ہو گیا۔ ${resolvedItems.length} اشیاء تیار ہیں۔` : `List parsed successfully. ${resolvedItems.length} items ready for review.`);
        } else {
          onNotify(
            isUr 
              ? "کوئی بھی چیز دستیاب نہیں تھی، لسٹ خالی رہی۔"
              : "No available products found from your list.",
            "warning"
          );
          addLog(isUr ? "کوئی بھی چیز دستیاب نہیں تھی، کارٹ میں کچھ شامل نہیں کیا گیا۔" : "No available products matched.");
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
        const targetId = prod ? prod.id : (item.productId || ("scanned_" + String(item.name || "item").toLowerCase().replace(/[^a-z0-9]/g, '_')));
        const targetName = prod ? prod.name : (item.name || "Custom Product");
        const targetNameUr = prod ? prod.nameUr : (item.nameUr || targetName);
        const targetPrice = prod ? ((prod.salePrice && prod.salePrice > 0) ? prod.salePrice : prod.price) : (item.price || 150);

        draftItems.push({
          productId: targetId,
          qty: Math.max(1, Math.round(parseFloat(item.qty) || 1)),
          action: "set",
          name: targetName,
          nameUr: targetNameUr,
          price: targetPrice,
          category: prod ? prod.category : (item.category || "Grocery"),
          unit: prod ? prod.unit : (item.unit || "item"),
          unitUr: prod ? prod.unitUr : (item.unitUr || "عدد"),
          matched: true,
          confidence: "high",
          currencyCode: prod ? (prod.currencyCode || prod.currency || "PKR") : "PKR"
        });

        resolvedItems.push({
          productId: targetId,
          name: targetName,
          nameUr: targetNameUr,
          price: targetPrice,
          unit: prod ? prod.unit : (item.unit || "item"),
          unitUr: prod ? prod.unitUr : (item.unitUr || "عدد"),
          currencyCode: prod ? (prod.currencyCode || prod.currency || "PKR") : "PKR",
          qty: Math.max(1, Math.round(parseFloat(item.qty) || 1)),
          action: "set"
        });
      });

      setVoiceDraftList(draftItems);
      if (resolvedItems.length > 0) {
        onNotify(
          isUr 
            ? `${resolvedItems.length} اشیاء ڈرافٹ لسٹ میں ملیں۔ کارٹ میں شامل کرنے کے لیے 'Add to Cart' پر کلک کریں۔` 
            : `Parsed ${resolvedItems.length} items into review list! Click 'Add to Cart' to confirm.`, 
          "success"
        );
      }
    } else {
      onNotify(lang === "ur" ? "پتہ نہیں چل سکا، براہ کرم پروڈکٹ کیٹلاگ چیک کریں۔" : "Command terms untracked. Try adding custom products.", "warning");
    }
  };

  // Automatic background recipe detection on typing is removed to avoid redundant triggers.
  // Manual search or selection is preferred for cleaner user interactions.

  
  const handleRecipeSearch = async (queryText) => {
    const textToSearch = queryText || customText || transcriptText;
    if (!textToSearch || !textToSearch.trim()) return;

    setRecipeLoading(true);
    addLog(isUr ? `ریسپی تلاش کی جا رہی ہے: "${textToSearch}"` : `Searching recipe database for: "${textToSearch}"`);

    // 1. Check local recipe database first for instant loading
    try {
      const localRecipe = findMatchingRecipe(textToSearch, products || []);
      if (localRecipe) {
        processRecipePresentation(localRecipe, textToSearch);
        setRecipeLoading(false);
        return;
      }
    } catch (localErr) {
      console.warn("Local recipe matching failed, falling back to API search:", localErr);
    }

    try {
      const res = await api.searchRecipe(textToSearch, lang, currency);
      if (res && res.recipe) {
        processRecipePresentation(res.recipe, textToSearch);
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
        // Use high-definition JPEG quality 0.92 for crisp OCR text recognition
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
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
    if (!file) return;
    const defaultMime = file.type || "image/jpeg";
    setScannerMimeType(defaultMime);
    setScannerPreviewUrl(URL.createObjectURL(file));
    setScannerImageFile(file);
    setScannerError("");

    // Compress client image with high clarity for OCR text recognition (up to 2560px for razor-sharp receipt text)
    compressScannerImage(file, 2560, 2560, (compressedBase64) => {
      setScannerBase64(compressedBase64);
      setScannerMimeType("image/jpeg");
      // Trigger single clean automatic scan with high-resolution compressed buffer
      executeAIInvoiceScan(compressedBase64, "image/jpeg");
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

  // Camera Control Functions for Live Invoice Scanner
  const startCamera = async (facing = cameraFacingMode) => {
    setIsCameraLoading(true);
    setCameraError("");
    if (cameraStreamRef.current) {
      try {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      cameraStreamRef.current = null;
    }
    try {
      const constraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920, max: 2560 },
          height: { ideal: 1080, max: 1440 }
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(e => console.warn("Video play warning:", e));
      }
      setIsCameraActive(true);
      setIsCameraLoading(false);

      // Detect torch capability
      const track = stream.getVideoTracks()[0];
      if (track && typeof track.getCapabilities === "function") {
        const capabilities = track.getCapabilities();
        setHasTorchSupport(!!capabilities.torch);
      } else {
        setHasTorchSupport(false);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setIsCameraActive(false);
      setIsCameraLoading(false);
      setCameraError(
        isUr
          ? "کیمرا تک رسائی حاصل نہیں ہو سکی۔ براہ کرم کیمرے کی اجازت دیں یا تصویر اپ لوڈ کا آپشن استعمال کریں۔"
          : "Could not access camera. Please allow camera permissions or switch to Upload Photo mode."
      );
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      try {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsFlashlightOn(false);
  };

  const flipCamera = async () => {
    const nextFacing = cameraFacingMode === "environment" ? "user" : "environment";
    setCameraFacingMode(nextFacing);
    await startCamera(nextFacing);
  };

  const toggleFlashlight = async () => {
    if (!cameraStreamRef.current) return;
    const track = cameraStreamRef.current.getVideoTracks()[0];
    if (track && typeof track.applyConstraints === "function") {
      try {
        const nextState = !isFlashlightOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setIsFlashlightOn(nextState);
      } catch (e) {
        console.warn("Flashlight toggle error:", e);
      }
    }
  };

  const captureAndScanFromCamera = () => {
    if (!videoRef.current || !isCameraActive) {
      startCamera();
      return;
    }
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Jpeg = canvas.toDataURL("image/jpeg", 0.92);
      setScannerPreviewUrl(base64Jpeg);
      setScannerBase64(base64Jpeg);
      setScannerMimeType("image/jpeg");

      // Stop camera stream after capturing snapshot
      stopCamera();

      // Trigger AI Invoice scan immediately
      executeAIInvoiceScan(base64Jpeg, "image/jpeg");
    } catch (err) {
      console.error("Camera snapshot error:", err);
      onNotify(isUr ? "تصویر لینے میں مسئلہ آیا۔" : "Failed to capture image from camera.", "error");
    }
  };

  const executeAIInvoiceScan = async (base64Override = null, mimeOverride = null) => {
    // Guard against React SyntheticEvent objects being passed if called as event listener
    const base64ToUse = (typeof base64Override === "string" && base64Override.length > 50) 
      ? base64Override 
      : (typeof scannerBase64 === "string" && scannerBase64.length > 50 ? scannerBase64 : null);
    const mimeToUse = (typeof mimeOverride === "string" && mimeOverride.includes("/")) 
      ? mimeOverride 
      : (scannerMimeType || "image/jpeg");

    if (!base64ToUse) {
      onNotify(isUr ? "براہ کرم پہلے کوئی بل یا رسید منتخب کریں یا ڈراپ کریں۔" : "Please select or drop an invoice/bill scan first.", "warning");
      return;
    }
    setScannerLoading(true);
    setScannerError("");
    setExtractedDraft([]);
    addLog(isUr ? "رسید کی تصویر اسکین کی جا رہی ہے..." : "Scanning receipt image with AI...");

    try {
      let resultRaw = null;
      try {
        resultRaw = await api.processOcr(base64ToUse, mimeToUse);
      } catch (ocrApiErr) {
        console.warn("Client OCR API call fallback engaged:", ocrApiErr);
      }

      let result = [];
      if (Array.isArray(resultRaw)) {
        result = resultRaw;
      } else if (resultRaw && typeof resultRaw === "object") {
        result = resultRaw.items || resultRaw.products || resultRaw.data || [];
      }

      const activeCatalog = (products || []).filter(p => p.status !== "Inactive" && p.status !== "Unavailable" && p.status?.toLowerCase() !== "inactive" && p.status?.toLowerCase() !== "unavailable");
      const catalogList = activeCatalog.length > 0 ? activeCatalog : (products || []);

      // Filter out OCR header/footer summary noise lines
      const summaryNoiseExact = new Set([
        'total', 'subtotal', 'tax', 'gst', 'vat', 'discount', 'balance', 'change', 
        'cash', 'visa', 'mastercard', 'invoice', 'receipt', 'date', 'amount', 
        'cashier', 'billing', 'tel', 'phone', 'address', 'store', 'market', 
        'welcome', 'thank you', 'payment', 'card', 'customer', 'shoppe', 
        'bazaar', 'item count', 'items count', 'qty total', 'quantity total', 
        'discount total', 'grand total', 'net total', 'round off', 'gross amt', 
        'net amt', 'total amount'
      ]);
      
      const filteredResult = result.filter(item => {
        if (!item || !item.name || typeof item.name !== 'string') return false;
        const lowerName = item.name.toLowerCase().trim().replace(/[:#\-*.]/g, '').trim();
        if (lowerName.length < 2) return false;
        
        if (summaryNoiseExact.has(lowerName)) return false;
        if (/^\d+$/.test(lowerName) || /^[\s\d\-•*.)\]:]+$/.test(lowerName)) return false;
        
        if (item.price !== undefined && parseFloat(item.price) < 0) return false;
        return true;
      });

      const rawItemsToUse = (filteredResult && filteredResult.length > 0)
        ? filteredResult
        : (result && result.length > 0 ? result : []);

      let formatted = rawItemsToUse.map(rawItem => ({
        name: rawItem.name || "Scanned Item",
        nameUr: rawItem.nameUr || rawItem.name || "سکین شدہ چیز",
        price: typeof rawItem.price === "number" ? rawItem.price : (parseFloat(rawItem.price) || 0),
        qty: typeof rawItem.qty === "number" && rawItem.qty > 0 ? rawItem.qty : (parseInt(rawItem.qty) || 1),
        category: rawItem.category || "Grocery",
        unit: rawItem.unit || "item",
        unitUr: rawItem.unitUr || "عدد",
        productId: rawItem.productId || null,
        matched: rawItem.matched !== undefined ? rawItem.matched : false,
        currencyCode: rawItem.currencyCode || "PKR"
      }));

      if (formatted.length === 0) {
        try {
          addLog(isUr ? "براؤزر کلائنٹ او سی آر فعال کیا جا رہا ہے..." : "Attempting client-side browser OCR engine...");
          let TesseractModule = (typeof window !== "undefined" && window.Tesseract) ? window.Tesseract : null;

          // If Tesseract is not yet in window scope, dynamically inject script from CDN
          if (!TesseractModule && typeof window !== "undefined" && typeof document !== "undefined") {
            try {
              await new Promise((resolve) => {
                const existing = document.getElementById("tesseract-cdn-script");
                if (existing) {
                  if (window.Tesseract) return resolve(window.Tesseract);
                  existing.addEventListener("load", () => resolve(window.Tesseract));
                  existing.addEventListener("error", () => resolve(null));
                } else {
                  const script = document.createElement("script");
                  script.id = "tesseract-cdn-script";
                  script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
                  script.async = true;
                  script.onload = () => resolve(window.Tesseract);
                  script.onerror = () => resolve(null);
                  document.head.appendChild(script);
                }
              });
              if (window.Tesseract) {
                TesseractModule = window.Tesseract;
              }
            } catch (cdnErr) {
              console.warn("CDN Tesseract load fallback error:", cdnErr);
            }
          }

          const createWorkerFunc = TesseractModule?.createWorker || TesseractModule?.default?.createWorker;
          if (createWorkerFunc) {
            const worker = await createWorkerFunc("eng");
            const ret = await worker.recognize(base64ToUse);
            await worker.terminate();
            const clientText = ret && ret.data ? ret.data.text : "";
            if (clientText && clientText.trim().length > 2) {
              // Direct client-side parse
              const parseOcrTextToItemsClient = (text, catalog) => {
                if (!text || typeof text !== "string") return [];
                const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                const items = [];
                const noise = new Set(["total", "subtotal", "tax", "gst", "vat", "discount", "change", "cash", "invoice", "receipt", "date", "amount", "thank you"]);
                for (let line of lines) {
                  if (line.length < 2) continue;
                  const lower = line.toLowerCase();
                  if (noise.has(lower) || /^[\d\s.,\/:\-\#]+$/.test(line)) continue;
                  let cleanName = line.replace(/^\s*(?:\d+[\.\)\-]|[\-\*•\>\✓])\s*/, "").trim();
                  if (cleanName.length < 2) continue;
                  let qty = 1;
                  const qtyMatch = cleanName.match(/^(\d{1,2})\s*(?:x|\*)?\s+(.*)/i);
                  if (qtyMatch) {
                    qty = parseInt(qtyMatch[1], 10) || 1;
                    cleanName = qtyMatch[2].trim();
                  }
                  cleanName = cleanName.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

                  let match = matchProductFuzzy ? matchProductFuzzy(cleanName, cleanName, catalog) : null;
                  if (!match) {
                    const lowerName = cleanName.toLowerCase();
                    match = (catalog || []).find(p => (p.name || "").toLowerCase().trim() === lowerName || (p.nameUr || "").toLowerCase().trim() === lowerName);
                  }
                  if (match) {
                    const pStatus = String(match.status || "").toLowerCase().trim();
                    const isInactive = (pStatus === "inactive" || pStatus === "unavailable");
                    const isOutOfStock = typeof match.stockQuantity === "number" && match.stockQuantity <= 0;
                    const isAvailable = !isInactive && !isOutOfStock;
                    const activePrice = (match.salePrice && match.salePrice > 0) ? match.salePrice : (match.price || 150);
                    items.push({
                      name: match.name,
                      nameUr: match.nameUr || match.name,
                      category: match.category || "Grocery",
                      price: activePrice > 0 ? activePrice : 150,
                      qty,
                      unit: match.unit || "item",
                      unitUr: match.unitUr || "عدد",
                      productId: match.id,
                      matched: isAvailable,
                      isCatalogMatch: true,
                      isAvailable: isAvailable,
                      status: isAvailable ? "Available" : "Unavailable",
                      currencyCode: match.currencyCode || match.currency || "PKR"
                    });
                  } else {
                    items.push({
                      name: cleanName,
                      nameUr: cleanName,
                      category: "Grocery",
                      price: 150,
                      qty,
                      unit: "item",
                      unitUr: "عدد",
                      productId: "scanned_" + (items.length + 1) + "_" + Date.now(),
                      matched: false,
                      isCatalogMatch: false,
                      isAvailable: false,
                      status: "Unavailable",
                      currencyCode: "PKR"
                    });
                  }
                }
                return items;
              };

              let clientParsed = parseOcrTextToItemsClient(clientText, catalogList);
              if (!clientParsed || clientParsed.length === 0) {
                const lowerText = clientText.toLowerCase();
                clientParsed = [];
                for (const p of catalogList) {
                  const pName = (p.name || "").toLowerCase().trim();
                  const pUr = (p.nameUr || "").toLowerCase().trim();
                  if ((pName.length >= 3 && lowerText.includes(pName)) || (pUr.length >= 3 && lowerText.includes(pUr))) {
                    const isInactive = p.status === "Inactive" || p.status === "Unavailable" || p.status?.toLowerCase() === "inactive" || p.status?.toLowerCase() === "unavailable";
                    const isOutOfStock = typeof p.stockQuantity === "number" && p.stockQuantity <= 0;
                    const isAvailable = !isInactive && !isOutOfStock;
                    const activePrice = (p.salePrice && p.salePrice > 0) ? p.salePrice : (p.price || 150);
                    clientParsed.push({
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
                  }
                }
              }

              if (clientParsed && clientParsed.length > 0) {
                formatted = clientParsed;
              } else {
                const retryRaw = await api.processOcr(base64ToUse, mimeToUse, clientText);
                let retryResult = Array.isArray(retryRaw) ? retryRaw : (retryRaw?.items || retryRaw?.products || retryRaw?.data || []);
                if (retryResult.length > 0) {
                  const filteredRetry = retryResult.filter(item => {
                    if (!item || !item.name || typeof item.name !== 'string') return false;
                    const lowerName = item.name.toLowerCase().trim().replace(/[:#\-*.]/g, '').trim();
                    if (lowerName.length < 2) return false;
                    if (summaryNoiseExact.has(lowerName)) return false;
                    if (/^\d+$/.test(lowerName) || /^[\s\d\-•*.)\]:]+$/.test(lowerName)) return false;
                    return true;
                  });
                  if (filteredRetry.length > 0) {
                    formatted = filteredRetry.map(rawItem => ({
                      name: rawItem.name || "Scanned Item",
                      nameUr: rawItem.nameUr || rawItem.name || "سکین شدہ چیز",
                      price: typeof rawItem.price === "number" ? rawItem.price : (parseFloat(rawItem.price) || 0),
                      qty: typeof rawItem.qty === "number" && rawItem.qty > 0 ? rawItem.qty : (parseInt(rawItem.qty) || 1),
                      category: rawItem.category || "Grocery",
                      unit: rawItem.unit || "item",
                      unitUr: rawItem.unitUr || "عدد",
                      productId: rawItem.productId || null,
                      matched: rawItem.matched !== undefined ? rawItem.matched : true,
                      isCatalogMatch: rawItem.isCatalogMatch !== undefined ? rawItem.isCatalogMatch : true,
                      isAvailable: rawItem.isAvailable !== undefined ? rawItem.isAvailable : true,
                      status: rawItem.status || (rawItem.isAvailable !== false ? "Available" : "Unavailable"),
                      currencyCode: rawItem.currencyCode || "PKR"
                    }));
                  }
                }
              }
            }
          }
        } catch (clientOcrErr) {
          console.warn("Client-side Tesseract.js OCR fallback error:", clientOcrErr);
        }
      }

      if (formatted.length === 0) {
        setScannerLoading(false);
        setExtractedDraft([]);
        const noItemsMsg = isUr
          ? "تصویر سے کوئی پروڈکٹ نہیں مل سکی۔ آپ نیچے سے ہاتھ سے پروڈکٹ شامل کر سکتے ہیں۔"
          : "No products could be detected from this image. You can manually add items below.";
        setScannerError(noItemsMsg);
        onNotify(noItemsMsg, "warning");
        addLog(noItemsMsg);
        return;
      }

      addLog(isUr ? `رسید کامیابی سے اسکین ہو گئی۔ ${formatted.length} اشیاء کی فہرست تیار کی گئی۔` : `Successfully scanned receipt and compiled ${formatted.length} items.`);

      // Refresh catalog first to get any newly created or synced products
      if (onRefreshProducts) {
        try {
          await onRefreshProducts();
        } catch (e) {
          console.warn("Catalog refresh error:", e);
        }
      }

      // Step 3: Match with existing catalog and add all detected invoice items directly to the list/cart
      const finalDraftItems = [];

      for (const scanned of formatted) {
        let match = null;
        if (scanned.productId && (Number(scanned.productId) > 0 || String(scanned.productId).length > 0) && !String(scanned.productId).startsWith("scanned_")) {
          match = catalogList.find(p => String(p.id) === String(scanned.productId));
        }
        if (!match && scanned.name) {
          match = matchProductFuzzy(scanned.name, scanned.nameUr, catalogList);
        }
        if (!match && scanned.name) {
          const lowerName = scanned.name.toLowerCase().trim();
          match = catalogList.find(p => {
            const pName = (p.name || "").toLowerCase().trim();
            const pNameUr = (p.nameUr || "").toLowerCase().trim();
            return pName === lowerName || pNameUr === lowerName;
          });
        }

        const isMatched = !!(match && match.id);
        const pStatus = String(match?.status || "").toLowerCase().trim();
        const isInactive = (pStatus === "inactive" || pStatus === "unavailable");
        const isOutOfStock = typeof match?.stockQuantity === "number" && match.stockQuantity <= 0;
        const isAvailable = isMatched && !isInactive && !isOutOfStock && (match.price > 0 || match.salePrice > 0);
        const activePrice = isMatched ? ((match.salePrice && match.salePrice > 0) ? match.salePrice : match.price) : (parseFloat(scanned.price) > 0 ? parseFloat(scanned.price) : 150);

        const draftItem = {
          ...scanned,
          name: isMatched ? match.name : scanned.name,
          nameUr: isMatched ? (match.nameUr || match.name) : (scanned.nameUr || scanned.name),
          price: activePrice > 0 ? activePrice : 150,
          qty: typeof scanned.qty === "number" && scanned.qty > 0 ? scanned.qty : 1,
          category: isMatched ? match.category : (scanned.category || "Grocery"),
          unit: isMatched ? match.unit : (scanned.unit || "item"),
          unitUr: isMatched ? match.unitUr : (scanned.unitUr || "عدد"),
          productId: isMatched ? match.id : (scanned.productId || ("scanned_" + (finalDraftItems.length + 1) + "_" + Date.now())),
          matched: isAvailable,
          isCatalogMatch: isMatched,
          isAvailable: isAvailable,
          status: isAvailable ? "Available" : "Unavailable",
          confidence: isMatched ? "high" : "medium",
          currencyCode: isMatched ? (match.currencyCode || match.currency || "PKR") : (scanned.currencyCode || "PKR")
        };
        finalDraftItems.push(draftItem);

        if (isAvailable) {
          addLog(isUr 
            ? `"${draftItem.name}" (مقدار: ${draftItem.qty}) رسید سے حاصل کی گئی اور دستیاب ہے۔` 
            : `Extracted "${draftItem.name}" (Qty: ${draftItem.qty}) - Available in store.`
          );
        } else {
          addLog(isUr 
            ? `"${draftItem.name}" رسید میں موجود ہے مگر اسٹور کیٹلاگ میں غیر دستیاب (Unavailable) ہے۔` 
            : `Extracted "${draftItem.name}" - Marked as Unavailable in store.`
          );
        }
      }

      setExtractedDraft(finalDraftItems);

      const availCount = finalDraftItems.filter(i => i.isAvailable).length;
      const unavailCount = finalDraftItems.filter(i => !i.isAvailable).length;

      if (availCount > 0) {
        onNotify(
          isUr 
            ? `رسید اسکین ہو گئی! ${availCount} دستیاب اشیاء تیار ہیں۔ کارٹ میں شامل کرنے کے لیے 'Add to Cart' پر کلک کریں۔` 
            : `Invoice scanned! ${availCount} available item(s) extracted. Click 'Add to Cart' to add to cart.`, 
          "success"
        );
      } else {
        onNotify(
          isUr 
            ? `رسید سے ${unavailCount} پروڈکٹس موصول ہوئیں مگر وہ اسٹور میں غیر دستیاب (Unavailable) ہیں۔` 
            : `Extracted ${unavailCount} item(s) from invoice, but they are marked as Unavailable in store catalog.`, 
          "warning"
        );
      }

      addLog(isUr 
        ? `بل اسکین سمری: ${availCount} دستیاب اشیاء کارٹ میں شامل ہوئیں، ${unavailCount} غیر دستیاب ہیں۔` 
        : `Invoice scan summary: ${availCount} available item(s) added, ${unavailCount} unavailable item(s) marked.`
      );

      // Clear scanner file inputs but keep draft review list
      setScannerImageFile(null);
      setScannerPreviewUrl(null);
      setScannerBase64(null);
    } catch (err) {
      console.error("AI Bill scan err:", err);
      setExtractedDraft([]);
      const errMsg = isUr
        ? "تصویر پڑھنے میں مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں یا نیچے ہاتھ سے پروڈکٹ شامل کریں۔"
        : "Failed to process list photo. Please try uploading the image again or add items manually below.";
      setScannerError(errMsg);
      onNotify(errMsg, "warning");
      addLog(errMsg);
    } finally {
      setScannerLoading(false);
    }
  };

  const executeAIListScan = async (textToScan = null) => {
    const rawText = (typeof textToScan === "string" && textToScan.trim()) 
      ? textToScan.trim() 
      : selectedListText.trim();

    if (!rawText) {
      onNotify(isUr ? "براہ کرم پہلے پروڈکٹ لسٹ منتخب کریں یا درج کریں۔" : "Please select or enter a product list first.", "warning");
      return;
    }

    setScannerLoading(true);
    setScannerError("");
    setExtractedDraft([]);
    addLog(isUr ? "اے آئی پروڈکٹ لسٹ اسکین کر رہا ہے..." : "Scanning product list with AI...");

    try {
      let parsed = [];
      try {
        parsed = await api.parseVoice(rawText);
      } catch (err) {
        console.warn("AI list parse API fallback engaged:", err);
      }

      let rawItems = [];
      if (Array.isArray(parsed)) {
        rawItems = parsed;
      } else if (parsed && typeof parsed === "object") {
        rawItems = parsed.items || parsed.products || parsed.data || [];
      }

      if (!rawItems || rawItems.length === 0) {
        const lines = rawText.split(/[,\n;]+/).map(s => s.trim()).filter(Boolean);
        rawItems = lines.map(line => {
          const qtyMatch = line.match(/^(\d+(?:\.\d+)?)\s*(?:x\s*|kilo|kg|g|gm|liter|litre|l|pack|packs|dozen|box|boxes|bottle|bottles|عدد|کلو|لیٹر|درجن)?\s*(.+)/i) 
            || line.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(?:kilo|kg|g|gm|liter|litre|l|pack|packs|dozen|box|boxes|bottle|bottles|عدد|کلو|لیٹر|درجن)?$/i);
          
          let parsedQty = 1;
          let parsedName = line;
          if (qtyMatch) {
            if (qtyMatch[1] && !isNaN(parseFloat(qtyMatch[1]))) {
              parsedQty = Math.max(1, Math.round(parseFloat(qtyMatch[1])));
              parsedName = qtyMatch[2] || line;
            } else if (qtyMatch[2] && !isNaN(parseFloat(qtyMatch[2]))) {
              parsedQty = Math.max(1, Math.round(parseFloat(qtyMatch[2])));
              parsedName = qtyMatch[1] || line;
            }
          }
          return {
            name: parsedName.trim(),
            nameUr: parsedName.trim(),
            qty: parsedQty,
            unit: "item",
            unitUr: "عدد",
            price: 150
          };
        });
      }

      const catalogList = (products && products.length > 0) ? products : [];

      const finalDraftItems = [];

      for (const item of rawItems) {
        if (!item || !item.name) continue;
        let match = null;
        if (item.productId && (Number(item.productId) > 0 || String(item.productId).length > 0)) {
          match = catalogList.find(p => String(p.id) === String(item.productId));
        }
        if (!match && item.name) {
          match = matchProductFuzzy(item.name, item.nameUr, catalogList);
        }
        if (!match && item.name) {
          const lowerName = item.name.toLowerCase().trim();
          match = catalogList.find(p => {
            const pName = (p.name || "").toLowerCase().trim();
            const pNameUr = (p.nameUr || "").toLowerCase().trim();
            return pName === lowerName || pNameUr === lowerName;
          });
        }

        const isMatched = !!(match && match.id);
        const pStatus = String(match?.status || "").toLowerCase().trim();
        const isInactive = (pStatus === "inactive" || pStatus === "unavailable");
        const isOutOfStock = typeof match?.stockQuantity === "number" && match.stockQuantity <= 0;
        const isAvailable = isMatched && !isInactive && !isOutOfStock && (match.price > 0 || match.salePrice > 0);

        if (isAvailable && match) {
          addLog(isUr 
            ? `"${match.name}" اسٹور کیٹلاگ میں دستیاب ہے۔` 
            : `"${match.name}" is available in store catalog.`
          );
        } else {
          addLog(isUr 
            ? `"${item.name}" فی الحال غیر دستیاب (Unavailable) ہے۔` 
            : `"${item.name}" is marked as Unavailable.`
          );
        }

        const activePrice = isMatched ? ((match.salePrice && match.salePrice > 0) ? match.salePrice : match.price) : (parseFloat(item.price) > 0 ? parseFloat(item.price) : 150);

        const draftItem = {
          name: isMatched ? match.name : item.name,
          nameUr: isMatched ? (match.nameUr || match.name) : (item.nameUr || item.name),
          price: activePrice > 0 ? activePrice : 150,
          qty: item.qty > 0 ? item.qty : 1,
          category: isMatched ? match.category : (item.category || "Grocery"),
          unit: isMatched ? match.unit : (item.unit || "item"),
          unitUr: isMatched ? match.unitUr : (item.unitUr || "عدد"),
          productId: isMatched ? match.id : ("scanned_" + (finalDraftItems.length + 1) + "_" + Date.now()),
          matched: isAvailable,
          isCatalogMatch: isMatched,
          isAvailable: isAvailable,
          status: isAvailable ? "Available" : "Unavailable",
          confidence: isMatched ? "high" : "medium",
          currencyCode: isMatched ? (match.currencyCode || match.currency || "PKR") : (item.currencyCode || "PKR")
        };
        finalDraftItems.push(draftItem);
      }

      setExtractedDraft(finalDraftItems);

      const availCount = finalDraftItems.filter(i => i.isAvailable).length;
      const unavailCount = finalDraftItems.filter(i => !i.isAvailable).length;

      if (availCount > 0) {
        onNotify(
          isUr 
            ? `پروڈکٹ لسٹ اسکین ہو گئی! ${availCount} دستیاب اشیاء تیار ہیں۔ کارٹ میں شامل کرنے کے لیے 'Add to Cart' پر کلک کریں۔` 
            : `List scanned! ${availCount} available item(s) extracted. Click 'Add to Cart' to add to cart.`, 
          "success"
        );
      } else {
        onNotify(
          isUr 
            ? `لسٹ میں موجود پروڈکٹس فی الحال اسٹور میں غیر دستیاب ہیں۔` 
            : `Detected products are currently Unavailable in store catalog.`, 
          "warning"
        );
      }

      addLog(isUr 
        ? `لسٹ اسکین مکمل: ${availCount} دستیاب پروڈکٹس تیار، ${unavailCount} غیر دستیاب۔` 
        : `Product list scan complete: ${availCount} available item(s) extracted. ${unavailCount} item(s) tagged Unavailable.`
      );
    } catch (err) {
      console.error("AI Product List scan error:", err);
      setExtractedDraft([]);
      const errMsg = isUr ? "لسٹ اسکین کرنے میں خرابی ہوئی۔" : "Failed to scan product list. Please try again.";
      setScannerError(errMsg);
      onNotify(errMsg, "error");
      addLog(errMsg);
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

  const updateVoiceDraftRow = (index, field, value) => {
    setVoiceDraftList(prev => {
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
    
    // Check if item exists in catalog (exact or fuzzy match)
    const match = matchProductFuzzy(scannerManualInput.name.trim(), scannerManualInput.nameUr.trim(), products);

    const isMatched = !!match;
    const pStatus = String(match?.status || "").toLowerCase().trim();
    const isInactive = (pStatus === "inactive" || pStatus === "unavailable");
    const isOutOfStock = typeof match?.stockQuantity === "number" && match.stockQuantity <= 0;
    const isAvailable = isMatched && !isInactive && !isOutOfStock && (match.price > 0 || match.salePrice > 0);

    const newItem = {
      name: match ? match.name : scannerManualInput.name.trim(),
      nameUr: match ? match.nameUr : (scannerManualInput.nameUr.trim() || scannerManualInput.name.trim()),
      price: match ? ((match.salePrice && match.salePrice > 0) ? match.salePrice : match.price) : (parseFloat(scannerManualInput.price) > 0 ? parseFloat(scannerManualInput.price) : 150),
      qty: Math.max(1, parseInt(scannerManualInput.qty) || 1),
      category: match ? match.category : "Grocery",
      unit: match ? match.unit : (scannerManualInput.unit || "item"),
      unitUr: match ? match.unitUr : (scannerManualInput.unitUr || "عدد"),
      productId: match ? match.id : ("scanned_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6)),
      matched: isAvailable,
      isCatalogMatch: isMatched,
      isAvailable: isAvailable,
      status: isAvailable ? "Available" : "Unavailable",
      confidence: match ? "high" : "medium",
      currencyCode: match ? (match.currencyCode || match.currency || "PKR") : "PKR"
    };

    setExtractedDraft(prev => [...prev, newItem]);

    setScannerManualInput({
      name: "",
      nameUr: "",
      price: 150,
      qty: 1,
      category: "Grocery",
      unit: "item",
      unitUr: "عدد"
    });
    onNotify(`Added '${newItem.name}' to review list!`, "success");
  };

  // Map and add raw scanned items to active cart state
  const handleAddSingleScannerItemToCart = (index) => {
    const scanned = extractedDraft[index];
    if (!scanned) return;

    let match = null;
    if (scanned.productId && !String(scanned.productId).startsWith("scanned_")) {
      match = products.find(p => String(p.id) === String(scanned.productId));
    }
    if (!match && scanned.name) {
      match = matchProductFuzzy(scanned.name, scanned.nameUr, products);
    }

    const isMatched = !!(match && match.id);
    const pStatus = String(match?.status || "").toLowerCase().trim();
    const isInactive = (pStatus === "inactive" || pStatus === "unavailable");
    const isOutOfStock = typeof match?.stockQuantity === "number" && match.stockQuantity <= 0;
    const isAvailable = isMatched && !isInactive && !isOutOfStock && (match.price > 0 || match.salePrice > 0);

    if (!isAvailable) {
      onNotify(
        isUr 
          ? `"${scanned.nameUr || scanned.name}" اسٹور کیٹلاگ میں غیر دستیاب (Unavailable) ہے۔` 
          : `"${scanned.name}" is marked as Unavailable in the store catalog.`,
        "warning"
      );
      addLog(`Cannot add unavailable item '${scanned.name}' to cart.`);
      return;
    }

    const finalProductId = match ? match.id : scanned.productId;
    const activePrice = (match.salePrice && match.salePrice > 0) ? match.salePrice : match.price;
    const itemQty = Math.max(1, Math.round(parseInt(scanned.qty) || 1));
    const itemToAdd = {
      productId: finalProductId,
      name: match.name,
      nameUr: match.nameUr || match.name,
      price: activePrice > 0 ? activePrice : 150,
      unit: match.unit || scanned.unit || "item",
      unitUr: match.unitUr || scanned.unitUr || "عدد",
      category: match.category || scanned.category || "Grocery",
      currencyCode: match.currencyCode || match.currency || "PKR",
      qty: itemQty,
      action: "add"
    };

    if (onAddItems) {
      onAddItems([itemToAdd]);
      onNotify(isUr ? `"${itemToAdd.nameUr || itemToAdd.name}" کارٹ میں شامل کر دیا گیا!` : `Added "${itemToAdd.name}" to cart!`, "success");
      addLog(`Added '${itemToAdd.name}' (Qty: ${itemToAdd.qty}) to cart.`);
    }

    removeDraftRow(index);
  };

  const handleAddScannerItemsToCart = async () => {
    if (extractedDraft.length === 0) return;

    const availableItemsToAdd = [];
    let unavailableCount = 0;

    for (const scanned of extractedDraft) {
      let match = null;
      if (scanned.productId && !String(scanned.productId).startsWith("scanned_")) {
        match = products.find(p => String(p.id) === String(scanned.productId));
      }
      if (!match && scanned.name) {
        match = matchProductFuzzy(scanned.name, scanned.nameUr, products);
      }
      const isMatched = !!(match && match.id);
      const pStatus = String(match?.status || "").toLowerCase().trim();
      const isInactive = (pStatus === "inactive" || pStatus === "unavailable");
      const isOutOfStock = typeof match?.stockQuantity === "number" && match.stockQuantity <= 0;
      const isAvailable = isMatched && !isInactive && !isOutOfStock && (match.price > 0 || match.salePrice > 0);

      if (isAvailable && match) {
        const activePrice = (match.salePrice && match.salePrice > 0) ? match.salePrice : match.price;
        availableItemsToAdd.push({
          productId: match.id,
          name: match.name,
          nameUr: match.nameUr || match.name,
          price: activePrice > 0 ? activePrice : 150,
          unit: match.unit || scanned.unit || "item",
          unitUr: match.unitUr || scanned.unitUr || "عدد",
          category: match.category || scanned.category || "Grocery",
          currencyCode: match.currencyCode || match.currency || "PKR",
          qty: Math.max(1, Math.round(parseFloat(scanned.qty) || 1)),
          action: "add"
        });
      } else {
        unavailableCount++;
      }
    }

    if (availableItemsToAdd.length > 0 && onAddItems) {
      onAddItems(availableItemsToAdd);
      if (unavailableCount > 0) {
        onNotify(
          isUr 
            ? `${availableItemsToAdd.length} دستیاب پروڈکٹس کارٹ میں شامل کی گئیں (${unavailableCount} غیر دستیاب پروڈکٹس نظر انداز کی گئیں)۔` 
            : `Added ${availableItemsToAdd.length} available product(s) to your cart (${unavailableCount} unavailable product(s) skipped).`, 
          "success"
        );
      } else {
        onNotify(
          isUr 
            ? `تمام ${availableItemsToAdd.length} دستیاب پروڈکٹس کارٹ میں شامل کر دی گئیں۔` 
            : `Added all ${availableItemsToAdd.length} available product(s) to your shopping cart!`, 
          "success"
        );
      }
      addLog(`Added ${availableItemsToAdd.length} available item(s) to cart.`);
    } else {
      onNotify(
        isUr 
          ? "دریافت شدہ پروڈکٹس میں سے کوئی بھی اسٹور میں دستیاب نہیں ہے۔" 
          : "None of the detected products are currently available in the store catalog.",
        "warning"
      );
    }
    
    // Clear state
    setExtractedDraft([]);
    setScannerImageFile(null);
    setScannerPreviewUrl(null);
    setScannerBase64(null);
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
                        <span>{activeRecipeTitle ? (isUr ? `ترکیب: ${activeRecipeTitle}` : `Recipe: ${activeRecipeTitle}`) : (isUr ? "فعال صوتی بلک لسٹ" : "Active Voice Bulk List")}</span>
                      </span>
                      <span className="text-white/40 font-mono text-[9px] lowercase font-normal">
                        {voiceDraftList.length} {isUr ? "اجزاء" : "ingredients"}
                      </span>
                    </h4>

                    {/* Recipe Metadata info if available */}
                    {recipeCard && (
                      <div className="flex items-center gap-2 text-[10px] text-purple-200/80 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                        {recipeCard.prepTime && <span>⏱️ {recipeCard.prepTime}</span>}
                        {recipeCard.cookTime && <span>• 🍳 {recipeCard.cookTime}</span>}
                        {recipeCard.servings && <span>• 👥 {recipeCard.servings}</span>}
                      </div>
                    )}

                    {/* Availability alert if any items are unavailable */}
                    {voiceDraftList.some(item => !item.matched) && (
                      <div className="px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] font-semibold flex items-center gap-1.5">
                        <AlertCircle size={13} className="shrink-0 text-red-400" />
                        <span>
                          {isUr 
                            ? `${voiceDraftList.filter(i => !i.matched).length} اجزاء فی الحال غیر دستیاب ہیں۔`
                            : `${voiceDraftList.filter(i => !i.matched).length} required item(s) marked as Unavailable.`}
                        </span>
                      </div>
                    )}

                    <div className="max-h-[220px] overflow-y-auto flex flex-col gap-4 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                      
                      {/* Available section */}
                      {voiceDraftList.some(item => item.matched) && (
                        <div className="flex flex-col gap-1.5">
                          <h5 className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span>{isUr ? "دستیاب / میچ" : "Available / In Store"}</span>
                          </h5>
                          {voiceDraftList
                            .map((item, originalIndex) => ({ ...item, originalIndex }))
                            .filter(item => item.matched)
                            .map((item) => (
                            <div 
                              key={`avail-${item.originalIndex}`} 
                              className="flex items-center justify-between border border-green-500/20 bg-green-500/5 hover:border-green-500/35 p-2 rounded-xl text-xs transition duration-300"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                <span className="font-semibold text-white">
                                  {isUr ? item.nameUr : item.name}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                                  {item.qty || 1} {isUr ? (item.unitUr || item.unit || "کلو") : (item.unit || "kg")}
                                </span>
                                <span className="px-1 rounded text-[7px] font-bold tracking-tight uppercase ml-1 bg-green-500/25 text-green-300">
                                  {isUr ? "دستیاب" : "Available"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-white/40 text-[10px] font-mono">
                                  {formatPrice(item.price * (item.qty || 1), currency, lang, item.currencyCode)}
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
                            <span>{isUr ? "غیر دستیاب" : "Unavailable"}</span>
                          </h5>
                          {voiceDraftList.filter(item => !item.matched).map((item, idx) => (
                            <div 
                              key={`unavail-${idx}`} 
                              className="flex items-center justify-between border border-red-500/30 bg-red-500/10 hover:border-red-500/50 p-2 rounded-xl text-xs transition duration-300"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                <span className="font-semibold text-white/80">
                                  {isUr ? item.nameUr : item.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-xs text-red-400 bg-red-500/20 px-2.5 py-1 rounded-xl border border-red-500/30 select-none">
                                  {isUr ? "غیر دستیاب" : "Unavailable"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>

                    {/* MANUAL PRODUCT ADDITION FIELD */}
                    <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                      <input
                        type="text"
                        value={manualVoiceInput}
                        onChange={(e) => setManualVoiceInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddManualVoiceProduct();
                          }
                        }}
                        placeholder={isUr ? "خود سے پروڈکٹ ٹائپ کر کے شامل کریں..." : "Manually type product to add..."}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddManualVoiceProduct}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1 shrink-0"
                      >
                        <Plus size={14} />
                        <span>{isUr ? "شامل کریں" : "Add"}</span>
                      </button>
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
                  <span>{isUr ? "ترکیب کا نام لکھیں اور آخر میں 'recipe' شامل کریں (مثال: Biryani recipe, Haleem recipe)" : "Type recipe name followed by 'recipe' (e.g., Biryani recipe, Haleem recipe)."}</span>
                </div>

                {/* DROPDOWN-STYLE WORLD & PAKISTANI RECIPE SELECTOR */}
                <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900/60 to-indigo-950/50 border border-purple-500/30 text-left shadow-lg mb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📖</span>
                      <span>{isUr ? "ترکیب منتخب کریں (100 مکمل پاکستانی و عالمی ڈشز):" : "Select Recipe Dropdown (100 Complete Recipes):"}</span>
                    </span>
                    <span className="text-[10px] text-purple-300 font-bold bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                      100 {isUr ? "ریسپیز" : "Recipes"}
                    </span>
                  </div>

                  {/* Dropdown Select Element */}
                  <div className="relative w-full">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          setCustomText(e.target.value);
                          executeAIVoiceParse(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-950 text-purple-100 border border-purple-500/40 hover:border-purple-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer shadow-md transition appearance-none pr-9 text-left"
                      dir={isUr ? "rtl" : "ltr"}
                    >
                      <option value="" disabled className="bg-slate-900 text-gray-400">
                        {isUr ? "--- ڈراپ ڈاؤن لسٹ میں سے ترکیب منتخب کریں ---" : "--- Select a Recipe from Dropdown (100 Available) ---"}
                      </option>
                      {VOICE_ASSISTANT_100_RECIPES.map((rec, i) => (
                        <option key={i} value={rec.query} className="bg-slate-900 text-white font-medium py-1">
                          {rec.icon} {isUr ? rec.nameUr : rec.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-3 text-purple-400 pointer-events-none" />
                  </div>

                  {/* Quick Recipe Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-white/10 whitespace-nowrap">
                    {VOICE_ASSISTANT_100_RECIPES.slice(0, 24).map((rec, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setCustomText(rec.query);
                          executeAIVoiceParse(rec.query);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-400/50 text-[11px] font-medium text-purple-200 flex items-center gap-1 transition cursor-pointer active:scale-95 shrink-0"
                      >
                        <span>{rec.icon}</span>
                        <span>{isUr ? rec.nameUr : rec.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    ref={manualInputRef}
                    type="text"
                    placeholder={isUr ? "پروڈکٹس اور ترکیبات خود سے یہاں شامل کریں (مثال: چاول، بریانی، دودھ)..." : "Manually add products or recipes here (e.g. Basmati Rice, Biryani, Milk)..."}
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



              </div>
            </div>
          )}

          {/* VIEW: AI RECEIPT/BILL SCANNER & PRODUCT LIST MODULE */}
          {activeMode === "scanner" && (
            <div className="flex flex-col w-full h-full justify-between gap-5">
              
              {/* Header */}
              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="p-1 px-3 rounded-full bg-indigo-400/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 font-display uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <Sparkles size={11} className="text-indigo-400 animate-spin" />
                    <span>AI Smart Scan</span>
                  </span>
                </div>
                <h2 className="font-display font-bold text-2xl text-white mb-1.5 tracking-tight">
                  {isUr ? "اے آئی انوائس و پروڈکٹ لسٹ اسکینر" : "AI Invoice & Product List Scanner"}
                </h2>
                <p className="text-white/60 text-xs max-w-md mx-auto leading-relaxed">
                  {isUr 
                    ? "کاغذی بل یا رسید کی تصویر اپ لوڈ کریں۔ اے آئی خودکار طور پر تمام اشیاء پڑھ کر آپ کی گروسری فہرست میں شامل کر دے گا۔"
                    : "Upload an invoice or paper bill photo. AI will automatically scan, extract all items, and add them directly to your list."}
                </p>
              </div>

              {/* Sub-mode switcher: Upload Photo vs Add Products List */}
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/70 border border-white/10 rounded-xl max-w-sm mx-auto w-full select-none shadow-inner">
                <button
                  type="button"
                  onClick={() => setScannerSubMode("upload")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    scannerSubMode === "upload" || scannerSubMode === "photo"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                  id="tab-scanner-upload"
                >
                  <UploadCloud size={14} />
                  <span>{isUr ? "تصویر اپ لوڈ" : "Upload Invoice Photo"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScannerSubMode("list")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    scannerSubMode === "list"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                  id="tab-scanner-list"
                >
                  <FileText size={14} />
                  <span>{isUr ? "پروڈکٹ لسٹ" : "Add Products List"}</span>
                </button>
              </div>

              {/* SUBMODE 1: UPLOAD PHOTO INVOICE */}
              {(scannerSubMode === "upload" || scannerSubMode === "photo") && (
                <div className="flex-1 min-h-[180px] flex flex-col justify-center">
                  {!scannerPreviewUrl ? (
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-400 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition bg-black/40 hover:bg-black/60 cursor-pointer text-center relative group shadow-inner"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScannerFileChange}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        id="input-scanner-file"
                      />
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition duration-300">
                        <UploadCloud size={32} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {isUr ? "اپنی رسید یا کاغذی بل کی تصویر اپ لوڈ کریں" : "Upload or Drop Invoice Image Here"}
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                          {isUr ? "کلک کریں یا فائل یہاں منتقل کریں۔ اے آئی تمام اشیاء پڑھ کر لسٹ میں ڈال دے گا۔" : "Click to browse or drag & drop. AI will automatically scan and add all items to your list."}
                        </p>
                      </div>
                      <span className="mt-1 px-3 py-1 rounded-full bg-white/10 text-[10px] font-semibold text-white/70 border border-white/10">
                        PNG, JPG, JPEG, WEBP
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/50 border border-indigo-500/30 p-5 rounded-2xl relative group shadow-xl">
                      <button
                        onClick={() => {
                          setScannerImageFile(null);
                          setScannerPreviewUrl(null);
                          setScannerBase64(null);
                          setExtractedDraft([]);
                        }}
                        className="absolute -top-2.5 -right-2.5 p-1.5 bg-red-500 hover:bg-red-600 border border-red-400 text-white rounded-full transition shadow-lg shrink-0 cursor-pointer"
                        title={isUr ? "تصویر ہٹائیں" : "Remove Image"}
                      >
                        <Trash2 size={13} />
                      </button>
                      
                      <div className="relative shrink-0">
                        <img
                          src={scannerPreviewUrl}
                          alt="scanned invoice preview"
                          className="w-28 h-28 object-cover rounded-xl border border-white/20 bg-white/5 shadow-md"
                        />
                        {scannerLoading && (
                          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-1 text-center">
                            <Loader2 size={22} className="animate-spin text-indigo-400 mb-1" />
                            <span className="text-[9px] font-bold text-indigo-200">Scanning AI...</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-xs font-bold text-white truncate max-w-[260px]">
                          {scannerImageFile?.name || (isUr ? "انوائس تصویر" : "Invoice Photo")}
                        </p>
                        {scannerImageFile?.size && (
                          <p className="text-[10px] text-indigo-300 font-semibold font-mono mt-0.5">
                            {(scannerImageFile.size / 1024).toFixed(1)} KB — Image Ready
                          </p>
                        )}

                        <div className="flex items-center gap-2.5 mt-3 flex-wrap justify-center sm:justify-start">
                          <button
                            onClick={() => executeAIInvoiceScan()}
                            disabled={scannerLoading}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-500/25"
                            id="btn-execute-ai-scan"
                          >
                            {scannerLoading ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>{isUr ? "اسکیننگ و پروسیسنگ..." : "Scanning & Extracting..."}</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={14} className="animate-pulse text-amber-300" />
                                <span>{isUr ? "دوبارہ اسکین کریں" : "Rescan & Extract Items"}</span>
                              </>
                            )}
                          </button>

                          <label className="bg-white/10 hover:bg-white/15 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-white/10">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleScannerFileChange}
                              className="hidden"
                            />
                            <UploadCloud size={13} className="text-indigo-300" />
                            <span>{isUr ? "دوسری تصویر منتخب کریں" : "Choose Another Image"}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUBMODE 2: ADD PRODUCTS LIST */}
              {scannerSubMode === "list" && (
                <div className="flex flex-col gap-3.5 bg-black/30 border border-white/10 p-4 rounded-2xl">
                  {/* Preset list selector dropdown & custom creator */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={13} className="text-purple-400" />
                        <span>{isUr ? "پروڈکٹ لسٹ منتخب کریں:" : "Select / Choose Product List:"}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCustomListModal(true)}
                        className="text-[10px] font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full transition cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={11} />
                        <span>{isUr ? "نئی لسٹ بنائیں" : "New Custom List"}</span>
                      </button>
                    </div>

                    {/* Quick Select Preset List Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-white/10">
                      {savedProductLists.map((list) => {
                        const isSelected = selectedListText === list.items;
                        return (
                          <button
                            key={list.id}
                            type="button"
                            onClick={() => setSelectedListText(list.items)}
                            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                              isSelected
                                ? "bg-purple-500/30 border-purple-400 text-purple-100 shadow-sm"
                                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span>{list.icon || "📋"}</span>
                            <span>{isUr ? (list.nameUr || list.name) : list.name}</span>
                            {list.id.startsWith("custom_") && (
                              <span
                                onClick={(e) => handleDeleteCustomList(list.id, e)}
                                className="ml-1 text-white/40 hover:text-red-400 transition"
                                title="Delete list"
                              >
                                ×
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* List Text Area */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>{isUr ? "پروڈکٹ لسٹ کے آئٹمز (آپ تبدیل بھی کر سکتے ہیں):" : "Product List Items (Editable):"}</span>
                      <span className="text-white/30 font-normal">{isUr ? "کوما یا نئی لائن سے الگ کریں" : "Comma or newline separated"}</span>
                    </label>
                    <textarea
                      rows={3}
                      value={selectedListText}
                      onChange={(e) => setSelectedListText(e.target.value)}
                      placeholder={isUr ? "مثال: 2L دودھ، 1 درجن انڈے، 5 کلو چاول، 2 لیٹر کوکنگ آئل، 1 کلو چینی" : "e.g. 2L Milk, 1 Dozen Eggs, 5kg Rice, 2L Cooking Oil, 1kg Sugar..."}
                      className="w-full bg-slate-950/70 border border-white/10 focus:border-purple-500 rounded-xl p-3 text-xs text-white placeholder-white/30 outline-none leading-relaxed resize-none font-sans"
                      dir={isUr ? "rtl" : "ltr"}
                      id="textarea-product-list"
                    />
                  </div>

                  {/* Action Button: Scan List with AI */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => executeAIListScan()}
                      disabled={scannerLoading || !selectedListText.trim()}
                      className="flex-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-500/20 uppercase tracking-wide"
                      id="btn-scan-product-list"
                    >
                      {scannerLoading ? (
                        <>
                          <Loader2 size={13} className="animate-spin text-slate-950" />
                          <span>{isUr ? "اے آئی لسٹ اسکین کر رہا ہے..." : "Scanning List with AI..."}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} className="animate-pulse text-slate-950" />
                          <span>{isUr ? "اے آئی سے لسٹ اسکین کریں" : "Scan List with AI"}</span>
                        </>
                      )}
                    </button>
                    {selectedListText && (
                      <button
                        type="button"
                        onClick={() => setSelectedListText("")}
                        className="px-3 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-xs font-semibold rounded-xl transition cursor-pointer"
                        title="Clear text"
                      >
                        {isUr ? "صاف کریں" : "Clear"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Modal for creating a new custom saved product list */}
              {showCustomListModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <FileText size={16} className="text-purple-400" />
                        <span>{isUr ? "نئی کسٹم پروڈکٹ لسٹ بنائیں" : "Create New Custom Product List"}</span>
                      </h3>
                      <button
                        onClick={() => setShowCustomListModal(false)}
                        className="text-white/50 hover:text-white text-lg font-bold"
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-white/70 block mb-1">
                          {isUr ? "لسٹ کا نام:" : "List Name:"}
                        </label>
                        <input
                          type="text"
                          placeholder={isUr ? "مثال: ماہانہ راشن یا ویک اینڈ ناشتہ" : "e.g. Monthly Grocery or Weekend Breakfast"}
                          value={customListName}
                          onChange={(e) => setCustomListName(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:border-purple-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-white/70 block mb-1">
                          {isUr ? "پروڈکٹس اور مقدار:" : "Products & Quantities:"}
                        </label>
                        <textarea
                          rows={3}
                          placeholder={isUr ? "مثال: 2L دودھ، 1 درجن انڈے، 5 کلو چاول، 1 پیک نمک" : "e.g. 2L Milk, 1 Dozen Eggs, 5kg Basmati Rice, 1 Pack Salt"}
                          value={customListItems}
                          onChange={(e) => setCustomListItems(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:border-purple-500 outline-none leading-relaxed"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setShowCustomListModal(false)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold rounded-xl transition"
                      >
                        {isUr ? "منسوخ" : "Cancel"}
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCustomList}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-purple-600/20"
                      >
                        {isUr ? "محفوظ کریں" : "Save List"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Show Scan failures if applicable */}
              {scannerError && (
                <div className="text-red-300 bg-red-500/10 border border-red-500/20 text-[11px] p-3 rounded-xl flex items-start gap-1.5 text-left leading-relaxed">
                  <AlertCircle size={14} className="shrink-0 text-red-400 mt-0.5" />
                  <span>{scannerError}</span>
                </div>
              )}

              {/* SCAN RESULTS & DRAFT REVIEW LIST */}
              {extractedDraft.length > 0 && (() => {
                const availableCount = extractedDraft.filter(i => i.isAvailable).length;
                const unavailableCount = extractedDraft.filter(i => !i.isAvailable).length;

                return (
                  <div className="border border-emerald-500/30 rounded-2xl p-4 bg-black/55 flex flex-col gap-3 animate-slide-in shadow-xl shadow-emerald-950/20">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h4 className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles size={13} className="text-emerald-400" />
                        <span>{isUr ? "تصویر سے دریافت شدہ پروڈکٹس" : "Products Detected from Image"}</span>
                      </h4>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-emerald-300 font-mono text-[10px] bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          {availableCount} {isUr ? "دستیاب" : "Available"}
                        </span>
                        {unavailableCount > 0 && (
                          <span className="text-red-300 font-mono text-[10px] bg-red-500/20 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                            {unavailableCount} {isUr ? "غیر دستیاب" : "Unavailable"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                      {extractedDraft.map((item, originalIndex) => {
                        const isAvailable = Boolean(item.isAvailable);
                        return (
                          <div 
                            key={`scan-item-${originalIndex}`} 
                            className={`flex items-center gap-2 border p-2.5 rounded-xl justify-between select-none transition-all duration-300 shadow-sm ${
                              isAvailable
                                ? "border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/50 shadow-emerald-500/5"
                                : "border-red-500/30 bg-red-500/10 hover:border-red-500/40 shadow-red-500/5"
                            }`}
                          >
                            <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                              {/* Name input with status badge */}
                              <div className="col-span-5 relative flex items-center">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => updateDraftRow(originalIndex, "name", e.target.value)}
                                  placeholder="Product title"
                                  className={`border rounded px-2 py-1 text-white text-[11px] outline-none h-7 w-full pr-22 truncate bg-slate-950/60 ${
                                    isAvailable ? "border-white/10 focus:border-emerald-400" : "border-red-500/30 focus:border-red-400"
                                  }`}
                                />
                                <span className={`absolute right-1 px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-tight uppercase select-none border ${
                                  isAvailable
                                    ? "bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
                                    : "bg-red-500/25 text-red-300 border-red-500/40"
                                }`}>
                                  {isAvailable ? (isUr ? "دستیاب" : "Available") : (isUr ? "غیر دستیاب" : "Unavailable")}
                                </span>
                              </div>

                              {/* Urdu Name input */}
                              <input
                                type="text"
                                value={item.nameUr}
                                onChange={(e) => updateDraftRow(originalIndex, "nameUr", e.target.value)}
                                placeholder="Urdu title"
                                className="border rounded px-2 py-1 text-white text-[11px] text-right outline-none h-7 col-span-4 bg-slate-950/60 border-white/10 focus:border-emerald-400"
                              />

                              {/* Qty control */}
                              <div className="col-span-3 flex items-center border border-white/10 bg-slate-950/60 rounded h-7">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentVal = parseInt(item.qty) || 1;
                                    const newQty = Math.max(1, currentVal - 1);
                                    updateDraftRow(originalIndex, "qty", newQty);
                                  }}
                                  className="px-1 text-xs text-white/50 hover:bg-white/5 flex-1 cursor-pointer h-full border-r border-white/10 font-bold"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={Math.max(1, Math.round(item.qty || 1))}
                                  onChange={(e) => updateDraftRow(originalIndex, "qty", Math.max(1, parseInt(e.target.value) || 1))}
                                  className="text-[10px] font-mono text-center w-7 text-white font-bold bg-transparent border-none outline-none p-0"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentVal = parseInt(item.qty) || 1;
                                    const newQty = Math.max(1, currentVal + 1);
                                    updateDraftRow(originalIndex, "qty", newQty);
                                  }}
                                  className="px-1 text-xs text-white/50 hover:bg-white/5 flex-1 cursor-pointer h-full border-l border-white/10 font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Price, Add to Cart & Dismiss actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div className="flex items-center bg-slate-950/60 border border-white/10 rounded h-7 px-1 w-16" title={`Price: ${item.price} ${item.currencyCode || "PKR"}`}>
                                <span className="text-[9px] text-white/40 font-mono mr-0.5">{EXCHANGE_RATES[currency]?.symbol || "Rs"}</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={Number(convertPrice(item.price, item.currencyCode || "USD", currency).toFixed(2))}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    const updatedBasePrice = convertPrice(val, currency, item.currencyCode || "USD");
                                    updateDraftRow(originalIndex, "price", updatedBasePrice);
                                  }}
                                  className="bg-transparent border-none text-white text-[10px] w-full font-mono outline-none p-0 text-center"
                                />
                              </div>

                              {/* Add to Cart button or Unavailable indicator */}
                              {isAvailable ? (
                                <button
                                  type="button"
                                  onClick={() => handleAddSingleScannerItemToCart(originalIndex)}
                                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] rounded-lg flex items-center gap-1 transition cursor-pointer active:scale-95 shrink-0 shadow-md shadow-emerald-500/20"
                                  title={isUr ? "کارٹ میں شامل کریں" : "Add to Cart"}
                                >
                                  <Plus size={12} className="stroke-[3]" />
                                  <span>{isUr ? "کارٹ میں شامل کریں" : "Add to Cart"}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAddSingleScannerItemToCart(originalIndex)}
                                  className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-[10px] rounded-lg flex items-center gap-1 transition cursor-pointer shrink-0"
                                  title={isUr ? "یہ پروڈکٹ اسٹور میں غیر دستیاب ہے" : "This product is unavailable in store catalog"}
                                >
                                  <AlertCircle size={11} className="text-red-400" />
                                  <span>{isUr ? "غیر دستیاب" : "Unavailable"}</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => removeDraftRow(originalIndex)}
                                className="p-1 text-white/45 hover:text-red-400 hover:bg-red-500/15 rounded transition border border-transparent hover:border-red-500/10 cursor-pointer shrink-0"
                                title="Dismiss item"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Inline manual addition inside parsed catalog */}
                    <form onSubmit={addScannerManualItemSubmit} className="flex gap-1.5 mt-1 border-t border-white/5 pt-2 flex-wrap sm:flex-nowrap">
                      <input
                        type="text"
                        placeholder="Add missing product..."
                        required
                        value={scannerManualInput.name}
                        onChange={(e) => setScannerManualInput({ ...scannerManualInput, name: e.target.value })}
                        className="bg-white/5 text-white border border-white/10 rounded-lg px-2 py-1 text-[11px] outline-none flex-1 focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="کسٹم اردو ترجمہ..."
                        value={scannerManualInput.nameUr}
                        onChange={(e) => setScannerManualInput({ ...scannerManualInput, nameUr: e.target.value })}
                        className="bg-white/5 text-white border border-white/10 rounded-lg px-2 py-1 text-[11px] text-right font-medium outline-none flex-1 focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-lg shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Plus size={11} />
                        <span>{isUr ? "شامل کریں" : "Add Row"}</span>
                      </button>
                    </form>

                    {/* Bulk approve and add available items to cart */}
                    <button
                      type="button"
                      onClick={handleAddScannerItemsToCart}
                      className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-emerald-500/20 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                      id="btn-bulk-approve-scanner"
                    >
                      <Check size={15} className="stroke-[3]" />
                      <span>
                        {availableCount > 0
                          ? (isUr 
                              ? `${availableCount} دستیاب پروڈکٹس کارٹ میں شامل کریں` 
                              : `Add ${availableCount} Available Product(s) to Cart`)
                          : (isUr 
                              ? "کوئی دستیاب پروڈکٹ موجود نہیں" 
                              : "No Available Products to Add")}
                      </span>
                    </button>
                  </div>
                );
              })()}

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
