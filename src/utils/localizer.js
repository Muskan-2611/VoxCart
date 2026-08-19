// Localization dictionary for bilingual Eng & Urdu support
// Automatically handles layout orientation (RTL vs LTR)

export const TRANSLATIONS = {
  en: {
    dir: "ltr",
    title: "VoxCart",
    tagline: "Speak your list, pay with ease",
    voiceShop: "Voice Assistant",
    browse: "Browse Shop",
    productDetails: "Product Details",
    wishlist: "Wishlist",
    orders: "Your Orders",
    admin: "Admin Control",
    logout: "Logout",
    guestLogin: "Login as Guest",
    adminLogin: "Login as Admin",
    or: "or",
    email: "Email Address",
    password: "Password",
    fullName: "Full Name",
    newAccount: "Create Account",
    authLogin: "Sign In",
    authRegister: "Sign Up",
    authSubmitLogin: "Sign In securely",
    authSubmitRegister: "Create Account securely",
    noAccount: "Don't have an account?",
    alreadyAccount: "Already have an account?",
    offlineAlert: "Offline Mode Active — Safe Catalog Browsing is Enabled. DB Synced operations (checkout/adjustments) will sync once connection returns.",
    offlineWarning: "You are offline. Checkout is disabled.",
    micInstruction: "Tap the mic and speak your shopping list...",
    micListening: "🎤 Listening... Go ahead, say something!",
    micError: "Speech error. Verify your microphone permissions.",
    speakYourList: "Speak Your Shopping List",
    speakSummary: "Just say what you need, like: '3 whole milk, 2 apples and a butter'",
    speakStatusReady: "Ready. Tap the microphone to talk.",
    speakStatusListening: "Microphone is online...",
    transcriptHeading: "Voice Command Log / Spoken Transcript",
    noTranscript: "Your spoken commands and diagnostic outputs will print here in real-time.",
    cartTitle: "Your Cart",
    cartEmpty: "Your cart is empty. Start speaking or browsing to add items!",
    cartSubtotal: "Subtotal",
    cartTax: "Tax (5%)",
    cartTotal: "Grand Total",
    cartCheckout: "Proceed to Checkout",
    receiptDownload: "Download Invoice PDF",
    backToHome: "Return to Home",
    productSearch: "Search products by name or category...",
    allCategories: "All Products",
    addedToCart: "Added to Cart successfully!",
    removedFromCart: "Removed from Cart successfully!",
    cartCleared: "Cart cleared!",
    orderPlaced: "Order successfully placed and logged! Grand Total: ",
    orderStatus: "Status",
    orderDate: "Date",
    orderID: "Order ID",
    noOrders: "No previous orders found. Checkout your first cart to see invoicing!",
    viewReceipt: "Print Invoice",
    adminTitle: "Admin Dashboard Insights",
    adminUsers: "Active Customers",
    adminProducts: "Total Inventory",
    adminSales: "Gross Revenue",
    adminOrders: "Total Receipts",
    adminAddProduct: "Provision New Product",
    adminProductList: "Manage Active Inventory",
    adminRecentOrders: "Recent Fulfilments",
    adminSalesCategory: "Revenue by Category",
    addBtn: "Add Product",
    editBtn: "Edit Item",
    deleteBtn: "Delete",
    productNameEn: "Product Name (English)",
    productNameUr: "Product Name (Urdu)",
    category: "Category",
    priceUsd: "Base Price (USD)",
    packagingEn: "Unit (English, e.g. lb, gallon)",
    packagingUr: "Unit (Urdu, e.g. پاؤنڈ, گیلن)",
    adminLogs: "Real-time Voice Diagnostic Logs",
    adminLogsDesc: "View live spoken commands and regex parsing metrics:",
    languageSelect: "Language",
    currencySelect: "Currency",
    themeMode: "Slate Dark Theme",
    searchPlaceholder: "Type here to filter..."
  },
  ur: {
    dir: "rtl",
    title: "ووکس کارٹ",
    tagline: "اپنی فہرست بولیں، آسانی سے ادائیگی کریں",
    voiceShop: "آواز کا اسسٹنٹ",
    browse: "دکان دیکھیں۔",
    productDetails: "مصنوعات کی تفصیلات",
    wishlist: "میری پسند",
    orders: "سابقہ آرڈر",
    admin: "ایڈمن پینل",
    logout: "لاگ آؤٹ",
    guestLogin: "بطور مہمان لاگ ان کریں",
    adminLogin: "ایڈمن لاگ ان کریں",
    or: "یا",
    email: "ای میل ایڈریس",
    password: "پاس ورڈ",
    fullName: "پورا نام",
    newAccount: "نیا اکاؤنٹ بنائیں",
    authLogin: "لاگ ان کریں",
    authRegister: "رجسٹریشن",
    authSubmitLogin: "محفوظ لاگ ان کریں",
    authSubmitRegister: "نیا اکاؤنٹ محفوظ بنائیں",
    noAccount: "اکاؤنٹ نہیں ہے؟",
    alreadyAccount: "پہلے سے اکاؤنٹ موجود ہے؟",
    offlineAlert: "آف لائن وضع فعال ہے۔ سیکیورٹی کی وجہ سے آرڈر صرف انٹرنیٹ کی بحالی پر جمع ہوگا۔",
    offlineWarning: "آپ آف لائن ہیں۔ آرڈر ابھی نہیں کیا جا سکتا۔",
    micInstruction: "مائیک دبائیں اور اپنی خریداری کی فہرست بولیں...",
    micListening: "🎤 سن رہا ہوں... براہ کرم بولیں!",
    micError: "مائیکروفون کی اجازت چیک کریں۔",
    speakYourList: "شاپنگ لسٹ بولیں",
    speakSummary: "مثال کے طور پر کہیں: 'دودھ، دو سیب اور مکھن شامل کریں'",
    speakStatusReady: "تیار ہے۔ بولنے کے لیے مائیک دباؤ۔",
    speakStatusListening: "مائیک آن ہے، بولیں...",
    transcriptHeading: "صوتی گفتگو اور تجزیاتی رکارڈ",
    noTranscript: "آپ کے بولے ہوئے الفاظ اور تشخیصی تفصیلات یہاں نظر آئیں گی۔",
    cartTitle: "میرا کارٹ",
    cartEmpty: "کارٹ خالی ہے۔ بول کر یا دکان دیکھ کر چیزیں شامل کریں!",
    cartSubtotal: "کل رقم",
    cartTax: "ٹیکس (5%)",
    cartTotal: "قائم شدہ کل رقم",
    cartCheckout: "آرڈر مکمل کریں",
    receiptDownload: "رسید ڈاؤن لوڈ کریں (PDF)",
    backToHome: "ہوم پیج پر جائیں",
    productSearch: "مصنوعات کے نام یا کیٹیگری سے تلاش کریں...",
    allCategories: "تمام مصنوعات",
    addedToCart: "چیز کامیابی سے شامل ہوگئی!",
    removedFromCart: "کارٹ سے خارج کردیا گیا!",
    cartCleared: "کارٹ صاف کردیا گیا!",
    orderPlaced: "آرڈر کامیابی کے ساتھ درج کرلیا گیا! کل رقم: ",
    orderStatus: "حالت",
    orderDate: "تاریخ",
    orderID: "آرڈر نمبر",
    noOrders: "کوئی آرڈر نہیں ملا۔ خریدیں اور رسیدیں جمع کریں!",
    viewReceipt: "رسید پرنٹ کریں",
    adminTitle: "ایڈمن ڈیش بورڈ اعداد و شمار",
    adminUsers: "فعال صارفین",
    adminProducts: "کل مصنوعات",
    adminSales: "مجموعی فروخت",
    adminOrders: "کل آرڈرز",
    adminAddProduct: "نئی پروڈکٹ شامل کریں",
    adminProductList: "انوینٹری کا انتظام",
    adminRecentOrders: "حالیہ آرڈرز",
    adminSalesCategory: "کاتگری کے مطابق فروخت",
    addBtn: "مصنوعات شامل کریں",
    editBtn: "ترمیم کریں",
    deleteBtn: "حذف کریں",
    productNameEn: "نام (انگریزی)",
    productNameUr: "نام (اردو)",
    category: "کیٹیگری",
    priceUsd: "بنیادی قیمت (USD)",
    packagingEn: "پیکنگ یونٹ (انگریزی)",
    packagingUr: "پیکنگ یونٹ (اردو)",
    adminLogs: "براہ راست وائس ڈائگناسٹک لاگز",
    adminLogsDesc: "بولے گئے الفاظ کا تجزیاتی ریکارڈ درج ذیل ہے:",
    languageSelect: "زبان",
    currencySelect: "کرنسی",
    themeMode: "اسلیٹ ڈارک تھیم",
    searchPlaceholder: "یہاں لکھیں..."
  }
};

export const EXCHANGE_RATES = {
  USD: { symbol: "$",    rate: 1,      flag: "🇺🇸", name: "US Dollar" },
  PKR: { symbol: "₨",   rate: 280,    flag: "🇵🇰", name: "Pakistani Rupee" },
  AED: { symbol: "د.إ",  rate: 3.67,   flag: "🇦🇪", name: "UAE Dirham" },
  EUR: { symbol: "€",    rate: 0.92,   flag: "🇪🇺", name: "Euro" },
  GBP: { symbol: "£",    rate: 0.79,   flag: "🇬🇧", name: "British Pound" },
  SAR: { symbol: "﷼",   rate: 3.75,   flag: "🇸🇦", name: "Saudi Riyal" }
};

export function updateExchangeRates(rates) {
  if (!rates) return;
  Object.keys(rates).forEach(key => {
    if (EXCHANGE_RATES[key]) {
      EXCHANGE_RATES[key].rate = rates[key];
    }
  });
}

export function formatPrice(price, currencyCode = "USD", lang = "en", fromCurrencyCode = null) {
  let toCode = (currencyCode || "USD").toUpperCase();
  let fromCode = fromCurrencyCode ? fromCurrencyCode.toUpperCase() : null;

  if (toCode.startsWith("CURR-")) {
    toCode = toCode.replace("CURR-", "");
  }
  if (fromCode && fromCode.startsWith("CURR-")) {
    fromCode = fromCode.replace("CURR-", "");
  }

  // Auto-detect base currency if not explicitly provided or if default USD receives large PKR price
  if (!fromCode) {
    fromCode = price > 50 ? "PKR" : "USD";
  } else if (fromCode === "USD" && price > 50 && !fromCurrencyCode) {
    fromCode = "PKR";
  }

  const fromRate = EXCHANGE_RATES[fromCode]?.rate || (fromCode === "PKR" ? 280 : 1);
  const cur = EXCHANGE_RATES[toCode] || EXCHANGE_RATES.USD;
  const usdPrice = price / fromRate;
  const converted = usdPrice * cur.rate;
  const rounded = Math.round(converted * 100) / 100;
  return lang === "ur" 
    ? `${rounded.toLocaleString()} ${cur.symbol}` 
    : `${cur.symbol}${rounded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function convertPrice(price, fromCurrency = "USD", toCurrency = "USD") {
  let fromCode = (fromCurrency || "USD").toUpperCase();
  let toCode = (toCurrency || "USD").toUpperCase();

  if (fromCode.startsWith("CURR-")) {
    fromCode = fromCode.replace("CURR-", "");
  }
  if (toCode.startsWith("CURR-")) {
    toCode = toCode.replace("CURR-", "");
  }

  // Auto-detect base currency if fromCurrency is "USD" but price > 50 (e.g. 1100 PKR)
  if (fromCode === "USD" && price > 50) {
    fromCode = "PKR";
  }

  const fromRate = EXCHANGE_RATES[fromCode]?.rate || (fromCode === "PKR" ? 280 : 1);
  const toRate = EXCHANGE_RATES[toCode]?.rate || 1;
  return (price / fromRate) * toRate;
}

export function formatDateTime(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return "Current Date & Time";
  
  // Format beautifully: "Mon Jun 21, 2026, 05:07 PM"
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const dayName = days[d.getDay()];
  const monthName = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  
  return `${dayName} ${monthName} ${day}, ${year}, ${timeStr}`;
}
