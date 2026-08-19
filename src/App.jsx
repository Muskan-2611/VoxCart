import React, { useState, useEffect } from "react";
import { TRANSLATIONS, updateExchangeRates, formatPrice } from "./utils/localizer";
import { api } from "./utils/api";
import Navbar from "./components/Navbar.jsx";
import VoiceAssistant from "./components/VoiceAssistant.jsx";
import CartSidebar from "./components/CartSidebar.jsx";
import ProductCatalog from "./components/ProductCatalog.jsx";
import FavouritesView from "./components/FavouritesView.jsx";
import OrdersView from "./components/OrdersView.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import SmartSuggestions from "./components/SmartSuggestions.jsx";
import PaymentView from "./components/PaymentView.jsx";
import LandingPage from "./components/LandingPage.jsx";
import AIChatbotWidget from "./components/AIChatbotWidget.jsx";
import FeedbackPage from "./components/FeedbackPage.jsx";
import { validateStrongPassword } from "./utils/passwordValidator";
import { Lock, Mail, User, Shield, KeyRound, CornerDownRight, Heart, Sparkles, Wifi, AlertCircle, ShoppingCart, Eye, EyeOff } from "lucide-react";

export default function App() {
  // --- 1. CORE BILINGUAL STATES
  const [lang, setLang] = useState(() => localStorage.getItem("voxcart_display_language") || "en");
  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem("voxcart_active_tab") || "home");
  const [currency, setCurrency] = useState(() => localStorage.getItem("voxcart_display_currency") || "USD");
  const [ratesVersion, setRatesVersion] = useState(0);
  const [pendingCheckoutData, setPendingCheckoutData] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    sessionStorage.setItem("voxcart_active_tab", activeTab);
  }, [activeTab]);

  // --- 2. USER SESSION STATES (Pure server-synced, session-token cached)
  const [user, setUser] = useState(() => {
    const cached = sessionStorage.getItem("voxcart_session");
    return cached ? JSON.parse(cached) : null;
  });

  const [authMode, setAuthMode] = useState("login"); // "login" | "register" | "reset"
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [randomPlaceholder, setRandomPlaceholder] = useState("e.g. Muskan Mehmood");

  // Email Verification States
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSentNotice, setCodeSentNotice] = useState("");

  useEffect(() => {
    const GENERIC_NAMES = [
      "Ayesha Khan", "Zainab Malik", "Hamza Ahmed", "Bilal Siddiqui", 
      "Saira Shah", "Fatima Jamil", "Omar Farooq", "Sana Yousaf", 
      "Ali Raza", "Zara Butt"
    ];
    const rand = GENERIC_NAMES[Math.floor(Math.random() * GENERIC_NAMES.length)];
    setRandomPlaceholder(`e.g. ${rand}`);
  }, []);

  // --- 3. DATA STORAGE STATES (Fully transient - read online, cached offline)
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [orders, setOrders] = useState(() => {
    const cached = localStorage.getItem("voxcart_orders_cache");
    try {
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [userCategories, setUserCategories] = useState([]);

  // Log streams for real-time diagnostic voice commands
  const [voiceLogs, setVoiceLogs] = useState([
    "System online. Bilingual parser engine loaded.",
    "Try saying: 'Add three apples and two bananas'"
  ]);

  // Notifications floating alert stack
  const [toasts, setToasts] = useState([]);

  // --- 4. STARTUP SYNCS & HOOKS
  useEffect(() => {
    // Sync browser online status
    const handleOnline = () => {
      setIsOnline(true);
      showToast("Internet connection recovered. Database synchronized.", "success");
      if (user) {
        syncAllUserData();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast(t.offlineAlert, "warning");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial products catalogue download
    fetchProducts();
    fetchExchangeRates();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user]);

  // Sync user databases when currentUser loads
  useEffect(() => {
    if (user) {
      syncAllUserData();
      // Auto redirect administrators to admin console, regular shoppers to home
      if (user.role === "admin") {
        setActiveTab("admin");
      } else {
        const cachedTab = sessionStorage.getItem("voxcart_active_tab");
        if (cachedTab && cachedTab !== "admin") {
          setActiveTab(cachedTab);
        } else {
          setActiveTab("home");
        }
      }
    } else {
      setCartItems([]);
      setFavourites([]);
      setOrders([]);
      setUserCategories([]);
    }
  }, [user]);

  // Periodically poll for real-time user data synchronization (e.g. order status changes from admin)
  useEffect(() => {
    syncAllUserData();
    const interval = setInterval(() => {
      syncAllUserData();
    }, 2000);
    return () => clearInterval(interval);
  }, [user, activeTab]);

  useEffect(() => {
    localStorage.setItem("voxcart_display_language", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("voxcart_display_currency", currency);
  }, [currency]);

  // Synchronize language and currency defaults logically
  const isFirstMount = React.useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (lang === "ur") {
      setCurrency("PKR");
    } else {
      setCurrency("USD");
    }
  }, [lang]);

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.warn("Catalog fetch failed, loading static seed backup.", err);
      // Fallback preseeded structures in case api offline
      setProducts([
        { id: 1, name: "Whole Milk", nameUr: "خالص دودھ", category: "Dairy", price: 3.99, img: "🥛", unit: "gallon", unitUr: "گیلن" },
        { id: 2, name: "Large Eggs", nameUr: "انڈے", category: "Dairy", price: 4.29, img: "🥚", unit: "dozen", unitUr: "درجن" },
        { id: 3, name: "Cheddar Cheese", nameUr: "پنیر", category: "Dairy", price: 5.49, img: "🧀", unit: "block", unitUr: "ٹکڑا" },
        { id: 4, name: "Butter", nameUr: "مکھن", category: "Dairy", price: 4.79, img: "🧈", unit: "pack", unitUr: "پیکٹ" },
        { id: 5, name: "Bananas", nameUr: "کیلے", category: "Fruits", price: 0.69, img: "🍌", unit: "lb", unitUr: "پاؤنڈ" },
        { id: 6, name: "Apples", nameUr: "سیب", category: "Fruits", price: 1.99, img: "🍎", unit: "lb", unitUr: "پاؤنڈ" },
        { id: 9, name: "Tomatoes", nameUr: "ٹماٹر", category: "Vegetables", price: 2.49, img: "🍅", unit: "lb", unitUr: "پاؤنڈ" },
        { id: 10, name: "Potatoes", nameUr: "آلو", category: "Vegetables", price: 1.29, img: "🥔", unit: "lb", unitUr: "پاؤنڈ" }
      ]);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      // Bypassing iframe CORS issues by calling our server-side API endpoint FIRST
      console.log("Client-side loading real-time exchange rates from server-side proxy endpoint...");
      const res = await api.getExchangeRates();
      if (res) {
        const ratesObj = res.rates ? res.rates : res;
        updateExchangeRates(ratesObj);
        console.log("Dynamically loaded real-time currency conversion rates via Server Proxy:", ratesObj);
        setRatesVersion(v => v + 1);
        return;
      }
    } catch (serverErr) {
      console.warn("Server proxy endpoint failed or offline, trying direct client fetch as fallback:", serverErr);
    }

    try {
      // Secondary fallback: Direct, client-side open exchange rate API
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      if (response.ok) {
        const data = await response.json();
        if (data && data.rates) {
          updateExchangeRates(data.rates);
          console.log("Dynamically synced raw client-side real-time exchange rates (USD/PKR):", data.rates.PKR);
          setRatesVersion(v => v + 1);
        }
      }
    } catch (clientErr) {
      console.warn("Direct client exchange rate fetch failed too. Using hardcoded offline conversion fallbacks.", clientErr);
    }
  };

  const syncAllUserData = async () => {
    const currentUserId = user?.id || "guest";
    try {
      // Execute fetches in parallel, catching individual failures so they don't reject the whole batch
      const [cart, favs, ords, uCats] = await Promise.all([
        api.getCart(currentUserId).catch(e => { console.warn("Cart sync failed:", e); return null; }),
        api.getFavourites(currentUserId).catch(e => { console.warn("Favourites sync failed:", e); return null; }),
        api.getOrders(currentUserId).catch(e => { console.warn("Orders sync failed:", e); return null; }),
        api.getUserCategories(currentUserId).catch(e => { console.warn("Categories sync failed:", e); return null; })
      ]);
      
      if (cart !== null && Array.isArray(cart)) {
        setCartItems(cart);
      }
      if (user && favs !== null) {
        setFavourites(favs);
      }
      if (ords !== null && Array.isArray(ords)) {
        const userOrds = (user && user.role === "admin")
          ? ords
          : ords.filter(o =>
              String(o.userId) === String(currentUserId) ||
              (user?.email && o.userEmail && String(o.userEmail).toLowerCase() === String(user.email).toLowerCase())
            );
        setOrders(userOrds);
        localStorage.setItem("voxcart_orders_cache", JSON.stringify(userOrds));
      }
      if (user && uCats !== null) {
        setUserCategories(uCats || []);
      }
    } catch (e) {
      console.warn("Silent server sync skipped (offline mode safe fallback is active).", e);
    }
  };

  const handleDeleteUserCategory = async (catId) => {
    if (!user) return;
    try {
      await api.deleteUserCategory(user.id, catId);
      setUserCategories(prev => prev.filter(c => c.id !== catId));
      showToast("Personal category deleted.", "info");
    } catch (err) {
      console.error("Failed to delete user category:", err);
    }
  };

  const handleRefreshUserCategories = async () => {
    if (!user) return;
    try {
      const uCats = await api.getUserCategories(user.id);
      setUserCategories(uCats || []);
    } catch (err) {
      console.error("Failed to refresh user categories:", err);
    }
  };

  // --- 5. ACTION EVENT TRIGGERS
  const showToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleAddLogs = (text) => {
    setVoiceLogs(prev => [text, ...prev].slice(0, 50));
  };

  // Verification code trigger helper
  const handleTriggerSendVerificationCode = async (targetEmail) => {
    const emailToUse = targetEmail || loginEmail;
    if (!emailToUse || !emailToUse.trim()) {
      setAuthError("Please enter your email address first.");
      return false;
    }
    setAuthError("");
    setSendingCode(true);
    try {
      const codeRes = await api.sendVerificationCode(emailToUse.trim());
      setVerificationStep(true);
      setCodeSentNotice(codeRes.message || `Verification code sent to ${emailToUse.trim()}.`);
      showToast(codeRes.message || `Verification code sent to ${emailToUse.trim()}. Please check your email.`, "info");
      return true;
    } catch (err) {
      setAuthError(err.message || "Failed to send verification code to " + emailToUse);
      return false;
    } finally {
      setSendingCode(false);
    }
  };

  const handleResendVerificationCode = async () => {
    await handleTriggerSendVerificationCode(loginEmail);
  };

  // Login execution handler with 2-step verification
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (authMode === "login") {
        if (!loginEmail) {
          setAuthError("Please enter your email address.");
          return;
        }

        // Step 1: If verification code step is not active yet, trigger verification code delivery
        if (!verificationStep) {
          await handleTriggerSendVerificationCode(loginEmail);
          return;
        }

        // Step 2: Submit with password & verification code
        if (!loginPassword) {
          setAuthError("Please enter your password.");
          return;
        }

        if (!verificationCodeInput || !verificationCodeInput.trim()) {
          setAuthError("Please enter the 6-digit verification code sent to your email.");
          return;
        }

        const loggedUser = await api.login(loginEmail, loginPassword, verificationCodeInput.trim());
        sessionStorage.setItem("voxcart_session", JSON.stringify(loggedUser));
        setUser(loggedUser);
        setVerificationStep(false);
        setVerificationCodeInput("");
        setCodeSentNotice("");
        showToast(`Welcome back, ${loggedUser.name}! Authentication verified.`, "success");
      } else if (authMode === "reset") {
        if (!resetEmail || !resetPassword) {
          setAuthError("Please fill in email and new password.");
          return;
        }
        const passVal = validateStrongPassword(resetPassword);
        if (!passVal.valid) {
          setAuthError(passVal.message);
          return;
        }
        await api.resetPassword(resetEmail, resetPassword);
        showToast("Password reset successfully! You can now log in with your new password.", "success");
        setAuthMode("login");
        setLoginEmail(resetEmail);
        setLoginPassword("");
        setResetEmail("");
        setResetPassword("");
      } else {
        if (!regName || !regEmail || !regPassword) {
          setAuthError("All credentials are required.");
          return;
        }
        const passVal = validateStrongPassword(regPassword);
        if (!passVal.valid) {
          setAuthError(passVal.message);
          return;
        }
        await api.register(regName, regEmail, regPassword);
        setLoginEmail(regEmail);
        setLoginPassword("");
        setRegName("");
        setRegEmail("");
        setRegPassword("");
        setVerificationStep(false);
        setVerificationCodeInput("");
        setCodeSentNotice("");
        setAuthMode("login");
        showToast("Account successfully registered! Please log in with your account credentials.", "success");
      }
    } catch (err) {
      setAuthError(err.message || "Authentication failed. Please check your credentials.");
    }
  };

  // Admin and Guest login quick bypass shortcuts (for developer checking sandbox)
  const handleQuickBypass = async (role) => {
    setAuthError("");
    try {
      const email = role === "admin" ? "admin@voxcart.com" : "guest@voxcart.com";
      const pw = role === "admin" ? "admin" : "guest";
      const loggedUser = await api.login(email, pw);
      sessionStorage.setItem("voxcart_session", JSON.stringify(loggedUser));
      setUser(loggedUser);
      showToast(`Logged in bypass: ${loggedUser.name} (${loggedUser.role})`, "success");
    } catch (err) {
      setAuthError("Quick bypass error. Ensure server.ts is compiling successfully.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("voxcart_session");
    sessionStorage.removeItem("voxcart_active_tab");
    setUser(null);
    setActiveTab("home");
    showToast("Signed out safely.", "info");
  };

  // Product increments
  const handleUpdateCartQty = async (productId, qty) => {
    const activeUserId = user ? user.id : "guest";
    try {
      // Optimistic state rendering
      const previousState = [...cartItems];
      let newState = [...cartItems];
      const existIdx = newState.findIndex(item => String(item.productId) === String(productId));
      
      if (existIdx > -1) {
        if (qty <= 0) {
          newState.splice(existIdx, 1);
        } else {
          newState[existIdx] = { ...newState[existIdx], qty };
        }
      } else if (qty > 0) {
        newState.push({ productId, qty });
      }

      setCartItems(newState);

      if (isOnline) {
        // Safe server sync
        await api.setCartQty(activeUserId, productId, qty);
      } else {
        showToast("Offline caching quantity changes locally. Will synchronize once online.", "info");
      }
    } catch (e) {
      showToast("Failed to update quantities.", "error");
    }
  };

  const handleAddMultipleProducts = async (items) => {
    const activeUserId = user ? user.id : "guest";
    try {
      let newState = [...cartItems];
      for (const item of items) {
        const existIdx = newState.findIndex(ci => String(ci.productId) === String(item.id));
        const targetQty = (existIdx > -1 ? newState[existIdx].qty : 0) + item.qty;
        
        if (existIdx > -1) {
          newState[existIdx] = { ...newState[existIdx], qty: targetQty };
        } else {
          newState.push({ productId: item.id, qty: targetQty });
        }
        
        if (isOnline) {
          await api.setCartQty(activeUserId, item.id, targetQty);
        }
      }
      setCartItems(newState);
      showToast(lang === "ur" ? "تمام اشیاء کارٹ میں شامل کردی گئیں!" : "All items successfully added to your cart!", "success");
    } catch (e) {
      showToast("Could not sync items.", "warning");
    }
  };

  // Multi item addition unpacked from voice command or scanner
  const handleAddItemsFromVoice = async (parsedItems) => {
    const activeUserId = user ? user.id : "guest";
    
    // Merge or accumulate parsed elements onto existing items lists immutably
    let newCart = [...cartItems];
    const updates = [];

    parsedItems.forEach(parsed => {
      // Validate and normalize quantities and units as whole numbers >= 1
      let qty = typeof parsed.qty === "number" && parsed.qty > 0 ? parsed.qty : (parseFloat(parsed.qty) || 1);
      const prod = products.find(p => String(p.id) === String(parsed.productId));
      
      if (prod) {
        const parsedUnitLower = (parsed.unit || "").toLowerCase();
        const isGramOrMl = (
          parsedUnitLower === "g" || parsedUnitLower === "gram" || parsedUnitLower === "grams" || parsedUnitLower === "گرام" ||
          parsedUnitLower === "ml" || parsedUnitLower === "milli" || parsedUnitLower === "milliliter" || parsedUnitLower === "milliliters" || parsedUnitLower === "ملی" ||
          (parsedUnitLower.includes("gram") || parsedUnitLower.includes("milli"))
        ) && !parsedUnitLower.includes("kg") && !parsedUnitLower.includes("kilo") && !parsedUnitLower.includes("کلو");

        if (isGramOrMl && qty >= 10) {
          qty = qty / 1000;
        }
      }
      qty = Math.max(1, Math.round(qty));

      const existIdx = newCart.findIndex(item => String(item.productId) === String(parsed.productId));
      if (parsed.action === "set") {
        if (existIdx > -1) {
          if (qty <= 0) {
            newCart = newCart.filter((_, idx) => idx !== existIdx);
          } else {
            newCart[existIdx] = { 
              ...newCart[existIdx], 
              qty: qty,
              name: parsed.name || newCart[existIdx].name || prod?.name,
              nameUr: parsed.nameUr || newCart[existIdx].nameUr || prod?.nameUr,
              price: parsed.price !== undefined ? parsed.price : (newCart[existIdx].price || prod?.price),
              unit: parsed.unit || newCart[existIdx].unit || prod?.unit,
              unitUr: parsed.unitUr || newCart[existIdx].unitUr || prod?.unitUr,
              currencyCode: parsed.currencyCode || newCart[existIdx].currencyCode || prod?.currencyCode
            };
          }
        } else if (qty > 0) {
          newCart.push({ 
            productId: parsed.productId, 
            qty: qty,
            name: parsed.name || prod?.name,
            nameUr: parsed.nameUr || prod?.nameUr,
            price: parsed.price !== undefined ? parsed.price : prod?.price,
            unit: parsed.unit || prod?.unit,
            unitUr: parsed.unitUr || prod?.unitUr,
            currencyCode: parsed.currencyCode || prod?.currencyCode || "PKR"
          });
        }
      } else if (parsed.action === "remove") {
        if (existIdx > -1) {
          const newQty = newCart[existIdx].qty - qty;
          if (newQty <= 0) {
            newCart = newCart.filter((_, idx) => idx !== existIdx);
          } else {
            newCart[existIdx] = { ...newCart[existIdx], qty: newQty };
          }
          updates.push({ productId: parsed.productId, qty: Math.max(0, newQty) });
        }
      } else {
        if (existIdx > -1) {
          const totalQty = newCart[existIdx].qty + qty;
          newCart[existIdx] = { 
            ...newCart[existIdx], 
            qty: totalQty,
            name: parsed.name || newCart[existIdx].name || prod?.name,
            nameUr: parsed.nameUr || newCart[existIdx].nameUr || prod?.nameUr,
            price: parsed.price !== undefined ? parsed.price : (newCart[existIdx].price || prod?.price),
            unit: parsed.unit || newCart[existIdx].unit || prod?.unit,
            unitUr: parsed.unitUr || newCart[existIdx].unitUr || prod?.unitUr,
            currencyCode: parsed.currencyCode || newCart[existIdx].currencyCode || prod?.currencyCode
          };
          updates.push({ productId: parsed.productId, qty: totalQty });
        } else {
          newCart.push({ 
            productId: parsed.productId, 
            qty: qty,
            name: parsed.name || prod?.name,
            nameUr: parsed.nameUr || prod?.nameUr,
            price: parsed.price !== undefined ? parsed.price : prod?.price,
            unit: parsed.unit || prod?.unit,
            unitUr: parsed.unitUr || prod?.unitUr,
            currencyCode: parsed.currencyCode || prod?.currencyCode || "PKR"
          });
          updates.push({ productId: parsed.productId, qty: qty });
        }
      }
    });

    setCartItems(newCart);

    if (isOnline) {
      // Sync bulk list with server
      await api.syncCart(activeUserId, newCart);
    } else {
      showToast("Offline: Queued bulk additions.", "info");
    }
  };

  const handleClearCart = async () => {
    const activeUserId = user ? user.id : "guest";
    setCartItems([]);
    if (isOnline) {
      await api.clearCart(activeUserId);
    }
  };

  const handleToggleFavourite = async (productId) => {
    const activeUserId = user ? user.id : "guest";
    try {
      const isFav = favourites.includes(productId);
      let newFavs = [...favourites];
      if (isFav) {
        newFavs = newFavs.filter(id => id !== productId);
      } else {
        newFavs.push(productId);
      }
      setFavourites(newFavs);
      if (isOnline) {
        await api.toggleFavourite(activeUserId, productId);
        showToast(isFav ? "Removed from Wishlist" : "Saved to Wishlist", "success");
      }
    } catch (e) {
      showToast("Failed to alter favorites", "error");
    }
  };

  const handleCheckoutSubmit = async (checkoutData) => {
    if (!user) return;
    if (!isOnline) {
      showToast(t.offlineWarning, "error");
      return;
    }
    setPendingCheckoutData(checkoutData);
    setActiveTab("payment");
  };

  const handlePaymentComplete = async (payload) => {
    try {
      const orderResult = await api.createOrder(user?.id || "guest", { ...payload, userEmail: user?.email });
      setOrders(prev => {
        const updated = [orderResult, ...prev];
        localStorage.setItem("voxcart_orders_cache", JSON.stringify(updated));
        return updated;
      });
      setCartItems([]);
      setPendingCheckoutData(null);
      showToast(`${t.orderPlaced} ${formatPrice(payload.total, currency, lang)} 🎉`, "success");
      setActiveTab("orders");
    } catch (err) {
      const fallbackOrder = {
        id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        userId: user?.id || "guest",
        userEmail: user?.email || "",
        items: payload.items || [],
        subtotal: payload.subtotal || 0,
        tax: payload.tax || 0,
        total: payload.total || 0,
        currency: currency || "USD",
        createdAt: new Date().toISOString(),
        status: "Processing",
        paymentMethod: payload.paymentMethod || "Cash on Delivery",
        paymentDetails: payload.paymentDetails || {},
        paymentStatus: payload.paymentStatus || "Pending"
      };
      setOrders(prev => {
        const updated = [fallbackOrder, ...prev];
        localStorage.setItem("voxcart_orders_cache", JSON.stringify(updated));
        return updated;
      });
      setCartItems([]);
      setPendingCheckoutData(null);
      showToast(`${t.orderPlaced} ${formatPrice(payload.total, currency, lang)} 🎉`, "success");
      setActiveTab("orders");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await api.deleteOrder(orderId);
      setOrders(prev => {
        const updated = prev.filter(o => o.id !== orderId);
        localStorage.setItem("voxcart_orders_cache", JSON.stringify(updated));
        return updated;
      });
      showToast(lang === "ur" ? "آرڈر کامیابی سے منسوخ اور ڈیلیٹ کر دیا گیا!" : "Order cancelled and deleted successfully!", "success");
      syncAllUserData();
    } catch (err) {
      showToast(err.message || "Failed to cancel order", "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between" dir={lang === "ur" ? "rtl" : "ltr"}>
      
      {/* Offline Alert Sticky Bar */}
      {!isOnline && (
        <div className="bg-amber-600/90 text-white font-medium text-xs py-2 px-4 text-center border-b border-amber-500/30 flex items-center justify-center gap-2 select-none animate-pulse">
          <Wifi size={14} className="shrink-0 animate-bounce" />
          <span>{t.offlineAlert}</span>
        </div>
      )}

      {user === null ? (
        /* ================= AUTHENTICATION / SIGN IN SCREEN ================= */
        <div className="flex-1 flex items-center justify-center bg-[#05060f] px-4 py-12 relative overflow-hidden">
          {/* Neon mesh circles floating background */}
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />

          <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10">
            {/* Header branding */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/5 hover:scale-105 transition-transform duration-300">
                <ShoppingCart size={48} className="text-purple-400" />
              </div>
              <h1 className="font-display font-black text-3xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mt-1 mb-1 uppercase tracking-wider">
                VoxCart
              </h1>
              <p className="text-white/50 text-sm font-medium">{t.bilingualSlogan || "Bilingual Voice-Controlled Smart Checkout"}</p>
            </div>

            {/* Error notifications block */}
            {authError && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 text-red-400 text-xs flex items-center gap-2 mb-6">
                <AlertCircle size={16} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              
              {/* If Verification Step is Active in Login Mode */}
              {authMode === "login" && verificationStep ? (
                <>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 flex flex-col gap-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-purple-300">
                      <Mail size={16} />
                      <span>Email Verification Code Sent!</span>
                    </div>
                    <p className="text-white/70 leading-relaxed">
                      A unique 6-digit security verification code has been sent to <span className="font-bold text-white">{loginEmail}</span>. Please enter it below.
                    </p>
                    {codeSentNotice && (
                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-purple-500/20 font-mono text-purple-200 text-[11px] break-all">
                        {codeSentNotice}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">6-Digit Security Code *</label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        placeholder="e.g. 123456"
                        value={verificationCodeInput}
                        onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-950 border-2 border-purple-500 focus:border-purple-400 rounded-xl pl-10 pr-4 py-3 text-lg font-mono font-bold text-purple-200 tracking-widest outline-none transition"
                      />
                      <Shield size={18} className="absolute left-3.5 top-3.5 text-purple-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-black py-3.5 px-6 rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20 active:scale-97 cursor-pointer select-none"
                  >
                    Verify & Complete Sign In
                  </button>

                  <div className="flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleResendVerificationCode}
                      disabled={sendingCode}
                      className="text-purple-300 hover:underline font-bold cursor-pointer"
                    >
                      {sendingCode ? "Sending Code..." : "Resend Verification Code"}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setVerificationStep(false); setVerificationCodeInput(""); setAuthError(""); }}
                      className="text-white/60 hover:text-white cursor-pointer"
                    >
                      Change Email / Password
                    </button>
                  </div>
                </>
              ) : (
                /* Standard Credentials Fields */
                <>
                  {authMode === "register" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-wider">{t.fullName}</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder={randomPlaceholder}
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none text-white transition font-medium"
                        />
                        <User size={16} className="absolute left-3.5 top-3.5 text-white/40" />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-wider">{t.email}</label>
                      {authMode === "login" && !verificationStep && (
                        <button
                          type="button"
                          onClick={() => handleTriggerSendVerificationCode(loginEmail)}
                          disabled={sendingCode || !loginEmail}
                          className="text-xs text-purple-300 font-bold hover:underline cursor-pointer flex items-center gap-1 disabled:opacity-40"
                        >
                          <Mail size={12} />
                          {sendingCode ? "Sending Code..." : "Send Verification Code"}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="e.g. user@example.com"
                        value={authMode === "login" ? loginEmail : authMode === "reset" ? resetEmail : regEmail}
                        onChange={(e) => {
                          if (authMode === "login") setLoginEmail(e.target.value);
                          else if (authMode === "reset") setResetEmail(e.target.value);
                          else setRegEmail(e.target.value);
                        }}
                        className="w-full bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none text-white transition font-medium"
                      />
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-white/40" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider">
                      {authMode === "reset" ? "New Password" : t.password}
                    </label>
                    <div className="relative">
                      <input
                        type={showAuthPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={authMode === "login" ? loginPassword : authMode === "reset" ? resetPassword : regPassword}
                        onChange={(e) => {
                          if (authMode === "login") setLoginPassword(e.target.value);
                          else if (authMode === "reset") setResetPassword(e.target.value);
                          else setRegPassword(e.target.value);
                        }}
                        className="w-full bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/10 rounded-xl pl-10 pr-12 py-3 text-sm outline-none text-white transition font-mono font-bold"
                      />
                      <KeyRound size={16} className="absolute left-3.5 top-3.5 text-white/40" />
                      <button
                        type="button"
                        onClick={() => setShowAuthPassword(!showAuthPassword)}
                        className="absolute right-3.5 top-3.5 text-white/40 hover:text-white transition cursor-pointer flex items-center justify-center focus:outline-none"
                        title={showAuthPassword ? "Hide password" : "Show password"}
                      >
                        {showAuthPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {(authMode === "register" || authMode === "reset") && (
                      <p className="text-[11px] text-purple-300/80 leading-tight pt-1 flex items-start gap-1">
                        <Shield size={12} className="shrink-0 text-purple-400 mt-0.5" />
                        <span>Password requires 8+ characters, including uppercase (A-Z), lowercase (a-z), digit (0-9), and a special character (e.g. !@#$%^&*).</span>
                      </p>
                    )}
                  </div>

                  {authMode === "login" && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => { setAuthError(""); setAuthMode("reset"); setResetEmail(loginEmail); }}
                        className="text-xs text-purple-300/80 hover:text-purple-200 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sendingCode}
                    className="mt-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20 active:scale-97 cursor-pointer select-none flex items-center justify-center gap-2"
                  >
                    {sendingCode 
                      ? "Sending Security Code..." 
                      : authMode === "login" 
                      ? "Send Verification Code & Login" 
                      : authMode === "reset" 
                      ? "Reset Password" 
                      : t.authSubmitRegister}
                  </button>
                </>
              )}
            </form>

            <div className="text-center mt-6 text-sm text-white/50 border-b border-white/10 pb-6">
              {authMode === "login" ? (
                <>
                  <span>{t.noAccount} </span>
                  <button 
                    onClick={() => { setAuthError(""); setAuthMode("register"); }}
                    className="text-purple-300 font-bold hover:underline cursor-pointer"
                  >
                    {t.newAccount}
                  </button>
                </>
              ) : authMode === "reset" ? (
                <button 
                  onClick={() => { setAuthError(""); setAuthMode("login"); }}
                  className="text-purple-300 font-bold hover:underline cursor-pointer"
                >
                  Back to Login
                </button>
              ) : (
                <>
                  <span>{t.alreadyAccount} </span>
                  <button
                    onClick={() => { setAuthError(""); setAuthMode("login"); }}
                    className="text-purple-300 font-bold hover:underline cursor-pointer"
                  >
                    {t.authLogin}
                  </button>
                </>
              )}
            </div>

            {/* Login screen spacing */}

          </div>
        </div>
      ) : (
        /* ================= PRIMARY APP WORKSPACE SCREEN ================= */
        <div className="flex-1 flex flex-col justify-start bg-[#05060f]">
          
          <Navbar
            user={user}
            lang={lang}
            setLang={setLang}
            currency={currency}
            setCurrency={setCurrency}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            isOnline={isOnline}
            ratesVersion={ratesVersion}
          />

          <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
            {activeTab === "home" && (
              <LandingPage
                lang={lang}
                currency={currency}
                onGetStarted={() => setActiveTab("voice")}
              />
            )}

            {activeTab === "voice" && (
              /* TAB: VOICE SHOP COMBINED WORKPLACE */
              <div className="flex flex-col gap-3">
                <VoiceAssistant
                  lang={lang}
                  currency={currency}
                  onAddItems={handleAddItemsFromVoice}
                  onClearCart={handleClearCart}
                  onCheckout={handleCheckoutSubmit}
                  addLog={handleAddLogs}
                  logs={voiceLogs}
                  onNotify={showToast}
                  onClearLogs={() => setVoiceLogs([])}
                  products={products}
                  onRefreshProducts={fetchProducts}
                />
                
                {/* Floating summary of active items logs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
                  <div className="lg:col-span-4">
                    <SmartSuggestions
                      lang={lang}
                      currency={currency}
                      orders={orders}
                      products={products}
                      onAddProduct={(pid, q) => handleUpdateCartQty(pid, (cartItems.find(i => i.productId === pid)?.qty || 0) + q)}
                      onAddMultipleProducts={handleAddMultipleProducts}
                    />
                  </div>
                  <div className="lg:col-span-8">
                     <CartSidebar
                       lang={lang}
                       currency={currency}
                       cartItems={cartItems}
                       onUpdateQty={handleUpdateCartQty}
                       onClearCart={handleClearCart}
                       onCheckout={handleCheckoutSubmit}
                       isOnline={isOnline}
                       products={products}
                     />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "browse" && (
              /* TAB: CATALOG SEARCH & DISCOVERY */
              <ProductCatalog
                lang={lang}
                currency={currency}
                user={user}
                products={products}
                favourites={favourites}
                cartItems={cartItems}
                userCategories={userCategories}
                onDeleteUserCategory={handleDeleteUserCategory}
                onRefreshUserCategories={handleRefreshUserCategories}
                onAddFromCatalog={(pid) => handleUpdateCartQty(pid, (cartItems.find(i => i.productId === pid)?.qty || 0) + 1)}
                onToggleFavourite={handleToggleFavourite}
                onAddItems={handleAddItemsFromVoice}
                onNotify={showToast}
              />
            )}

            {activeTab === "wishlist" && (
              /* TAB: SAVED LISTS */
              <FavouritesView
                lang={lang}
                currency={currency}
                products={products}
                favourites={favourites}
                onAddFromCatalog={(pid) => handleUpdateCartQty(pid, (cartItems.find(i => i.productId === pid)?.qty || 0) + 1)}
                onToggleFavourite={handleToggleFavourite}
              />
            )}

            {activeTab === "orders" && (
              /* TAB: INVOICING RECORDS */
              <OrdersView
                lang={lang}
                currency={currency}
                orders={orders}
                user={user}
                onNotify={showToast}
                onDeleteOrder={handleDeleteOrder}
                onReorder={handleAddMultipleProducts}
              />
            )}

            {activeTab === "feedback" && (
              /* TAB: CUSTOMER FEEDBACK & COMPLAINT SYSTEM */
              <FeedbackPage
                lang={lang}
                user={user}
                onNotify={showToast}
              />
            )}

            {activeTab === "admin" && user?.role === "admin" && (
              /* TAB: PRIVILEGED OPERATIONS */
              <AdminPanel
                lang={lang}
                currency={currency}
                logs={voiceLogs}
                products={products}
                onRefreshProducts={fetchProducts}
                onRefreshOrders={syncAllUserData}
                onNotify={showToast}
              />
            )}

            {activeTab === "payment" && pendingCheckoutData && (
              /* TAB: SECURE CHECKOUT AND PAYMENT GATEWAY */
              <PaymentView
                lang={lang}
                currency={currency}
                checkoutData={pendingCheckoutData}
                onSubmitPayment={handlePaymentComplete}
                onCancel={() => {
                  setPendingCheckoutData(null);
                  setActiveTab("voice");
                }}
              />
            )}
          </main>
        </div>
      )}

      {/* SYSTEM DYNAMIC RESPONSIVE FOOTER */}
      <footer className="w-full bg-slate-950/80 backdrop-blur-lg border-t border-white/10 pt-12 pb-8 mt-auto select-none font-sans relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex flex-col gap-8">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-white/5">
            {/* Column 1: Brand details (Lg: col-span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-base">🛒</span>
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent uppercase tracking-wider">
                  VoxCart
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed max-w-sm">
                {lang === "ur" 
                  ? "ووکس کارٹ — اردو اور انگریزی دونوں زبانوں میں صوتی احکامات کو سمجھنے والا اسٹور فرنٹ جو خریداری کے عمل کو تیز ترین بناتا ہے۔"
                  : "An ultra-modern, offline-resilient bilingual voice storefront. Transcribe audio, scan paper invoices, and auto-convert currency on the fly."}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
                  Secure Localized Server Active
                </span>
              </div>
            </div>

            {/* Column 2: Quick Features links (Lg: col-span-3) */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-purple-400">
                {lang === "ur" ? "بنیادی خصوصیات" : "System Modalities"}
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs text-white/40">
                <li className="hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer" onClick={() => { setActiveTab("voice"); }}>
                  <span>🎙️</span>
                  <span>{lang === "ur" ? "صوتی شاپنگ اسسٹنٹ" : "Voice-Controlled shopping"}</span>
                </li>
                <li className="hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer" onClick={() => { setActiveTab("browse"); }}>
                  <span>📦</span>
                  <span>{lang === "ur" ? "کیٹلاگ دریافت کریں" : "Catalog Discovery"}</span>
                </li>
                <li className="hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer" onClick={() => { setActiveTab("orders"); }}>
                  <span>🧾</span>
                  <span>{lang === "ur" ? "آرڈر رسیدیں" : "PDF Invoice Generator"}</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Live Conversion Indicators (Lg: col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                {lang === "ur" ? "شرح تبادلہ" : "Exchange Proxies"}
              </h4>
              <div className="flex flex-col gap-2">
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/60">USD ⇄ PKR</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">1 USD = 278.23 PKR</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/60">EUR ⇄ PKR</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">1 EUR = 301.12 PKR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyrights and system properties bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[11px] text-white/30 font-medium font-mono">
            <p>
              © 2026 VoxCart Inc. All rights reserved. Built with secure offline-first architecture.
            </p>
            <div className="flex items-center gap-4">
              <span className="hover:text-white transition cursor-help" title="Web Speech Recognition Interface">SPEECH RECOGNITION ACTIVE</span>
              <span>•</span>
              <span className="hover:text-white transition cursor-help" title="No telemetry or third party keys leakage">PRIVACY ASSURED</span>
            </div>
          </div>
        </div>
      </footer>

      {/* FLOAT NOTIFICATION POPUP CARD STACKS */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`shadow-2xl backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center gap-3 animate-slide-in pointer-events-auto shrink-0 select-none ${
              toast.type === "success"
                ? "bg-emerald-950/80 text-emerald-300 border-l-4 border-l-emerald-500"
                : toast.type === "error"
                  ? "bg-red-950/80 text-red-300 border-l-4 border-l-red-500"
                  : toast.type === "warning"
                    ? "bg-amber-950/80 text-amber-300 border-l-4 border-l-amber-500"
                    : "bg-purple-950/80 text-purple-300 border-l-4 border-l-purple-500"
            }`}
          >
            <span className="text-base shrink-0 p-1 bg-black/40 rounded-lg">
              {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : toast.type === "warning" ? "⚠" : "ℹ"}
            </span>
            <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* CUTE AI CHATBOT FIXED FLOATING WIDGET (VISIBLE ONLY FOR LOGGED-IN USERS ON USER-SIDE TABS) */}
      {user && activeTab !== "admin" && (
        <AIChatbotWidget
          lang={lang}
          currency={currency}
          activeTab={activeTab}
          user={user}
          onNavigate={(tab) => setActiveTab(tab)}
          products={products}
          cartItems={cartItems}
          orders={orders}
          favourites={favourites}
          onCategoryExtracted={handleRefreshUserCategories}
          onAddItems={handleAddItemsFromVoice}
          onNotify={showToast}
        />
      )}

    </div>
  );
}
