import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { TRANSLATIONS, formatPrice } from "../utils/localizer";
import { Search, Heart, ShoppingCart, Sparkles, Send, Keyboard, ChevronDown, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { parseVoiceCommand } from "../utils/voiceParser";
import { api } from "../utils/api";

export default function ProductCatalog({
  lang,
  currency,
  user,
  products,
  favourites,
  cartItems,
  userCategories = [],
  onDeleteUserCategory,
  onRefreshUserCategories,
  onAddFromCatalog,
  onToggleFavourite,
  onAddItems, // Passes the bilingual parser multi-addition back to App state
  onNotify
}) {
  const t = TRANSLATIONS[lang];
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typedCommand, setTypedCommand] = useState("");
  const [loadingItems, setLoadingItems] = useState(true);
  const [smartSearchResult, setSmartSearchResult] = useState(null);
  const [isSmartSearching, setIsSmartSearching] = useState(false);

  // Helper to convert parsed items into recipe review structure
  const convertParsedItemsToRecipe = (parsedItems, rawQuery) => {
    const recipeIngredients = parsedItems.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        name: prod ? prod.name : (item.name || "Product"),
        nameUr: prod ? prod.nameUr : (item.nameUr || "اشیاء"),
        category: prod ? prod.category : "Pantry",
        price: prod ? prod.price : 1.99,
        qty: item.qty || 1,
        unit: prod ? prod.unit : "pack",
        unitUr: prod ? prod.unitUr : "پیکٹ",
        matched: !!prod
      };
    });

    return {
      type: "recipe",
      recipeName: rawQuery,
      recipeNameUr: rawQuery,
      recipeIngredients: recipeIngredients,
      matchedProductIds: []
    };
  };

  // Universal Smart Search: Real-time query analysis
  useEffect(() => {
    const clean = searchTerm.trim();
    if (!clean) {
      setSmartSearchResult(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSmartSearching(true);
      try {
        const response = await api.smartSearch(clean, lang);
        if (response && (response.type === "recipe" || response.type === "filter")) {
          setSmartSearchResult(response);
        } else {
          setSmartSearchResult(null);
        }
      } catch (err) {
        console.error("Smart search failed:", err);
        setSmartSearchResult(null);
      } finally {
        setIsSmartSearching(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, lang]);

  const categoryScrollRef = useRef(null);

  const handleCategoryWheel = (e) => {
    const container = categoryScrollRef.current;
    if (container) {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingItems(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [products]);
  
  // Bulk selection states
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkQuantities, setBulkQuantities] = useState({}); // { [id]: qty }

  const [dbCategories, setDbCategories] = useState([]);
  const fetchCategories = useCallback(() => {
    api.getCategories()
      .then(list => {
        if (Array.isArray(list)) {
          const activeOnly = list.filter(c => c.status !== "Inactive");
          setDbCategories(activeOnly);
        } else {
          setDbCategories([]);
        }
      })
      .catch(e => console.warn("Could not retrieve db categories", e));
  }, []);

  const [dbSubcategories, setDbSubcategories] = useState([]);
  const fetchSubcategories = useCallback(() => {
    api.getSubcategories()
      .then(list => {
        if (Array.isArray(list)) {
          const activeOnly = list.filter(s => s.status !== "Inactive");
          setDbSubcategories(activeOnly);
        } else {
          setDbSubcategories([]);
        }
      })
      .catch(e => console.warn("Could not retrieve db subcategories", e));
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();

    // Fast polling interval so newly added or deleted categories/subcategories automatically reflect in Browse Shop
    const timer = setInterval(() => {
      fetchCategories();
      fetchSubcategories();
    }, 1500);

    return () => clearInterval(timer);
  }, [products, fetchCategories, fetchSubcategories]);

  // Automatic cleanup if currently selected category/subcategory was deleted from Admin
  useEffect(() => {
    if (activeCategory !== "All") {
      const existsInDb = dbCategories.some(c => c.name === activeCategory || c.id === activeCategory);
      const existsInUser = (userCategories || []).some(uc => uc.name === activeCategory || uc.id === activeCategory);
      const existsInProducts = products.some(p => p.category === activeCategory);
      if (!existsInDb && !existsInUser && !existsInProducts) {
        setActiveCategory("All");
        setActiveSubcategory(null);
      }
    }
  }, [dbCategories, userCategories, products, activeCategory]);

  useEffect(() => {
    if (activeSubcategory) {
      const existsInSub = dbSubcategories.some(s => s.id === activeSubcategory || s.name === activeSubcategory);
      if (!existsInSub) {
        setActiveSubcategory(null);
      }
    }
  }, [dbSubcategories, activeSubcategory]);

  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".category-dropdown-container")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const categoryItems = useMemo(() => {
    let baseList = [];
    if (dbCategories.length > 0) {
      baseList = [
        { id: "All", name: "All", nameUr: t.allCategories || "All" },
        ...dbCategories.map(c => ({
          id: c.id,
          name: c.name,
          nameUr: c.nameUr
        }))
      ];
    } else {
      const uniqueNames = [...new Set(products.map(p => p.category))];
      baseList = [
        { id: "All", name: "All", nameUr: t.allCategories || "All" },
        ...uniqueNames.map(name => ({
          id: name,
          name: name,
          nameUr: name
        }))
      ];
    }

    // ONLY IF USER IS LOGGED IN: Merge user-extracted categories (hidden on admin side)
    if (user && Array.isArray(userCategories) && userCategories.length > 0) {
      userCategories.forEach(uc => {
        const exists = baseList.some(b => b.name.toLowerCase() === uc.name.toLowerCase() || b.id === uc.id);
        if (!exists) {
          baseList.push({
            id: uc.id,
            name: uc.name,
            nameUr: uc.nameUr || uc.name,
            isUserExtracted: true,
            icon: uc.icon || "✨",
            description: uc.description
          });
        }
      });
    }

    return baseList;
  }, [dbCategories, products, user, userCategories, t.allCategories]);

  const selectedCount = Object.values(bulkQuantities).filter(qty => qty > 0).length;

  // Filtering products list
  const filteredProducts = products.filter(p => {
    if (!p) return false;

    // Support the universal smart search product ID filters
    if (smartSearchResult && smartSearchResult.type === "filter" && searchTerm.trim()) {
      return smartSearchResult.matchedProductIds.includes(Number(p.id));
    }
    
    // 1. Matches Category
    const currentCatObj = dbCategories.find(c => c.name === activeCategory || c.id === activeCategory);
    const activeCategoryId = currentCatObj ? currentCatObj.id : null;
    
    const userCatObj = (userCategories || []).find(uc => uc.id === activeCategory || uc.name === activeCategory);
    let matchesUserCat = false;
    if (userCatObj) {
      const kw = userCatObj.name.toLowerCase().split(" ")[0];
      matchesUserCat = (
        p.name.toLowerCase().includes(kw) ||
        (p.description && p.description.toLowerCase().includes(kw)) ||
        (p.category && p.category.toLowerCase().includes(kw))
      );
    }
    
    const matchesCategory = 
      activeCategory === "All" || 
      p.category?.toLowerCase() === activeCategory?.toLowerCase() ||
      p.categoryId?.toLowerCase() === activeCategory?.toLowerCase() ||
      (activeCategoryId && p.categoryId?.toLowerCase() === activeCategoryId.toLowerCase()) ||
      matchesUserCat;
      
    // 2. Matches Subcategory
    let matchesSubcategory = true;
    if (activeSubcategory) {
      const activeSubObj = dbSubcategories.find(s => s.id === activeSubcategory);
      const activeSubName = activeSubObj ? activeSubObj.name : null;
      const activeSubNameUr = activeSubObj ? activeSubObj.nameUr : null;
      
      matchesSubcategory = 
        p.subcategoryId?.toLowerCase() === activeSubcategory?.toLowerCase() ||
        (activeSubName && p.subcategory?.toLowerCase() === activeSubName.toLowerCase()) ||
        (activeSubName && p.subcategoryName?.toLowerCase() === activeSubName.toLowerCase()) ||
        (activeSubNameUr && p.subcategoryNameUr?.toLowerCase() === activeSubNameUr.toLowerCase());
    }
    const cleanSearch = searchTerm.toLowerCase().trim();
    const pName = p.name || "";
    const pCategory = p.category || "";
    const pNameUr = p.nameUr || "";
    const nameMatch = pName.toLowerCase().includes(cleanSearch);
    const urNameMatch = pNameUr.includes(cleanSearch);
    const categoryMatch = pCategory.toLowerCase().includes(cleanSearch);
    return matchesCategory && matchesSubcategory && (nameMatch || urNameMatch || categoryMatch);
  });

  // Handle manual typing product phrases (e.g. "3 eggs, whole milk")
  const handleTypingSubmit = async (e) => {
    e.preventDefault();
    const cleanCmd = typedCommand.trim();
    if (!cleanCmd) return;

    setIsSmartSearching(true);

    // 1. First check voice parser for multi-item or quantity typing e.g. "3 milk, 2 butter", "5 eggs", "add 2 bread"
    const parsed = parseVoiceCommand(cleanCmd, products);
    if (parsed && parsed.action === "update_items" && parsed.items && parsed.items.length > 0) {
      const resolvedItems = [];
      const addedNames = [];

      parsed.items.forEach(item => {
        let prod = products.find(p => String(p.id) === String(item.productId));
        if (!prod && item.name) {
          const searchName = item.name.toLowerCase();
          prod = products.find(p => 
            p.name.toLowerCase() === searchName || 
            p.name.toLowerCase().includes(searchName) || 
            (p.nameUr && p.nameUr.includes(searchName))
          );
        }
        if (prod && prod.status !== "Inactive" && prod.status !== "Unavailable") {
          resolvedItems.push({
            productId: prod.id,
            qty: item.qty || 1,
            action: item.action || "add"
          });
          addedNames.push(`${item.qty || 1} ${lang === "ur" ? (prod.nameUr || prod.name) : prod.name}`);
        }
      });

      if (resolvedItems.length > 0) {
        if (onAddItems) {
          onAddItems(resolvedItems);
        }
        const msg = lang === "ur"
          ? `کارٹ میں شامل کر دیا گیا: ${addedNames.join(", ")}`
          : `Added to cart: ${addedNames.join(", ")}`;
        if (onNotify) onNotify(msg, "success");
        setTypedCommand("");
        setIsSmartSearching(false);
        return;
      }
    }

    if (parsed && parsed.action === "clear") {
      if (onAddItems) {
        onAddItems([{ action: "clear" }]);
      }
      const clearMsg = lang === "ur" ? "کارٹ صاف ہو گیا!" : "Cart cleared successfully!";
      if (onNotify) onNotify(clearMsg, "success");
      setTypedCommand("");
      setIsSmartSearching(false);
      return;
    }

    // 2. Direct single product lookup by name or Urdu name
    const lowerCmd = cleanCmd.toLowerCase();
    const directMatch = products.find(p => 
      p.status !== "Inactive" && p.status !== "Unavailable" &&
      (p.name.toLowerCase() === lowerCmd || 
       p.name.toLowerCase().includes(lowerCmd) || 
       (p.nameUr && p.nameUr.toLowerCase().includes(lowerCmd)))
    );

    if (directMatch) {
      if (onAddItems) {
        onAddItems([{ productId: directMatch.id, qty: 1, action: "add" }]);
      }
      const msg = lang === "ur"
        ? `کارٹ میں شامل کر دیا گیا: ${directMatch.nameUr || directMatch.name}`
        : `Added to cart: ${directMatch.name}`;
      if (onNotify) onNotify(msg, "success");
      setTypedCommand("");
      setIsSmartSearching(false);
      return;
    }

    // 3. Fallback to smart search or recipe search
    try {
      const response = await api.smartSearch(cleanCmd, lang);
      if (response && (response.type === "recipe" || response.type === "filter")) {
        setSmartSearchResult(response);
        setSearchTerm(cleanCmd);
      } else {
        setSearchTerm(cleanCmd);
      }
    } catch (err) {
      setSearchTerm(cleanCmd);
    }
    setTypedCommand("");
    setIsSmartSearching(false);
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Filters, Chipsets & Search Controls */}
      <div className="glass-panel border border-white/10 rounded-3xl p-4 md:p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
          {/* Main Category Chips */}
          <div className="flex items-center gap-1.5 w-full md:flex-1 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (categoryScrollRef.current) {
                  categoryScrollRef.current.scrollBy({ left: -160, behavior: "smooth" });
                }
              }}
              className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-purple-500/20 hover:border-purple-500/40 transition active:scale-90 cursor-pointer shrink-0 shadow-sm"
              title={lang === "ur" ? "بائیں اسکرول کریں" : "Scroll Left"}
            >
              <ChevronLeft size={15} />
            </button>

            <div
              ref={categoryScrollRef}
              onWheel={handleCategoryWheel}
              className="flex flex-row items-center gap-2 overflow-x-auto overflow-y-hidden w-full py-1.5 whitespace-nowrap scroll-smooth scrollbar-none pr-1"
            >
              {categoryItems.map((catItem) => {
                const isSelected = activeCategory === catItem.name || activeCategory === catItem.id;
                const dispName = lang === "ur" ? catItem.nameUr : catItem.name;

                return (
                  <div key={catItem.id} className="relative group shrink-0 flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory(catItem.name);
                        setActiveSubcategory(null);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer shrink-0 active:scale-95 flex items-center gap-1.5 ${
                        catItem.isUserExtracted
                          ? isSelected
                            ? "bg-gradient-to-r from-amber-500/30 to-purple-600/30 border-amber-400/60 text-amber-200 shadow-lg shadow-amber-500/20"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/20"
                          : isSelected
                            ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-purple-400/50 text-purple-200 shadow-lg shadow-purple-500/15"
                            : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {catItem.isUserExtracted && <span className="text-amber-400 font-bold animate-pulse">✨</span>}
                      <span>{dispName}</span>
                      {catItem.isUserExtracted && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-mono font-bold lowercase">
                          {lang === "ur" ? "ذاتی" : "personal"}
                        </span>
                      )}
                    </button>
                    {catItem.isUserExtracted && onDeleteUserCategory && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(lang === "ur" ? "کیا آپ اس ذاتی کیٹیگری کو ختم کرنا چاہتے ہیں؟" : "Remove this custom AI category?")) {
                            onDeleteUserCategory(catItem.id);
                            if (activeCategory === catItem.name || activeCategory === catItem.id) {
                              setActiveCategory("All");
                            }
                          }
                        }}
                        className="ml-1 p-1 hover:bg-rose-500/30 text-rose-400/70 hover:text-rose-300 rounded-lg transition"
                        title={lang === "ur" ? "کیٹیگری حذف کریں" : "Remove category"}
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                if (categoryScrollRef.current) {
                  categoryScrollRef.current.scrollBy({ left: 160, behavior: "smooth" });
                }
              }}
              className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-purple-500/20 hover:border-purple-500/40 transition active:scale-90 cursor-pointer shrink-0 shadow-sm"
              title={lang === "ur" ? "دائیں اسکرول کریں" : "Scroll Right"}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Real-time search query box */}
          <div className="relative w-full md:w-80 shrink-0">
            <input
              type="text"
              placeholder={t.productSearch}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 text-white placeholder-gray-400 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:bg-slate-900 transition shadow-inner"
              dir={lang === "ur" ? "rtl" : "ltr"}
            />
            <Search size={16} className="absolute left-3.5 top-3.5 text-purple-400/70" />
          </div>
        </div>

        {/* Subcategory Row (shown if current category has subcategories) */}
        {activeCategory !== "All" && (() => {
          const currentCatObj = dbCategories.find(c => c.name === activeCategory || c.id === activeCategory);
          const subcategories = currentCatObj
            ? dbSubcategories.filter(sub => sub.categoryId === currentCatObj.id && sub.status !== "Inactive")
            : [];
          
          if (subcategories.length === 0) return null;

          return (
            <div className="flex flex-row items-center gap-2 overflow-x-auto overflow-y-auto w-full py-1.5 scrollbar-thin scrollbar-thumb-white/10 whitespace-nowrap border-t border-white/5 pt-3 mt-1 flex-nowrap">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mr-2">
                {lang === "ur" ? "ذیلی قسم:" : "Subcategory:"}
              </span>
              
              {/* "All" subcategory chip */}
              <button
                type="button"
                onClick={() => setActiveSubcategory(null)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
                  !activeSubcategory
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm"
                    : "bg-white/5 border-white/5 text-white/50 hover:border-white/10 hover:text-white/80"
                }`}
              >
                {lang === "ur" ? `تمام ${currentCatObj?.nameUr || ""}` : `All ${currentCatObj?.name}`}
              </button>

              {subcategories.map((sub) => {
                const isSubSelected = activeSubcategory === sub.id;
                const subDispName = lang === "ur" ? sub.nameUr : sub.name;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setActiveSubcategory(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
                      isSubSelected
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 scale-102"
                        : "bg-white/5 border-white/5 text-white/50 hover:border-white/10 hover:text-white/80"
                    }`}
                  >
                    {subDispName}
                  </button>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* NEW Typing Quick Add Command Option bar */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-indigo-950/40 backdrop-blur-xl border border-purple-500/15 rounded-2xl p-4 md:p-5">
        <form onSubmit={handleTypingSubmit} className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2.5 bg-purple-400/10 text-purple-300 rounded-xl border border-purple-400/20">
              <Keyboard size={20} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm tracking-tight">
                {lang === "ur" ? "ٹائپ کر کے کارٹ میں شامل کریں" : "Add to Cart by Typing"}
              </h4>
              <p className="text-2xs text-purple-300 font-medium">
                {lang === "ur" ? "کسی بھی ترکیب کا نام ٹائپ کریں اور مطلوبہ اشیاء حاصل کریں۔" : "Type any recipe and get the required items."}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-96">
            <input
              type="text"
              value={typedCommand}
              onChange={(e) => setTypedCommand(e.target.value)}
              placeholder={lang === "ur" ? "کسی بھی ترکیب کا نام ٹائپ کریں (مثال: Biryani)..." : "Type any recipe and get the required items..."}
              className="w-full bg-black/45 border border-white/10 focus:border-purple-400 focus:bg-black/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition"
              dir={lang === "ur" ? "rtl" : "ltr"}
            />
            <button
              type="submit"
              className="bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold p-3 rounded-xl transition cursor-pointer active:scale-95"
            >
              <Send size={15} />
            </button>
          </div>
        </form>
      </div>

      {/* NEW: Interactive Multi-Product Bulk Selection Dashboard */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-3.5 h-3.5 rounded-full ${bulkMode ? 'bg-amber-400 animate-pulse' : 'bg-white/10'}`}></div>
          <div>
            <h4 className="text-white font-bold text-sm">
              {lang === "ur" ? "ملٹی پروڈکٹ بلک موڈ" : "Multi-Product Bulk Selection Mode"}
            </h4>
            <p className="text-[11px] text-white/50">
              {lang === "ur" ? "کئی مختلف چیزیں منتخب کر کے ایک ساتھ کارٹ میں شامل کریں" : "Adjust draft quantities on as many products as you want first, then add them all!"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setBulkMode(!bulkMode);
              if (bulkMode) setBulkQuantities({});
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all select-none active:scale-95 border cursor-pointer ${
              bulkMode
                ? "bg-amber-500/20 border-amber-500/35 text-amber-300 shadow-sm"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
          >
            {lang === "ur" ? (bulkMode ? "بلک موڈ بند کریں" : "بلک موڈ آن کریں") : (bulkMode ? "Disable Bulk Mode" : "Enable Bulk Add Mode")}
          </button>

          {bulkMode && selectedCount > 0 && (
            <>
              <button
                type="button"
                onClick={() => setBulkQuantities({})}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 cursor-pointer transition select-none active:scale-95"
              >
                {lang === "ur" ? "صاف کریں" : "Clear Drafts"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const itemsToSubmit = Object.entries(bulkQuantities)
                    .filter(([_, qty]) => qty > 0)
                    .map(([id, qty]) => ({ productId: parseInt(id), qty }));
                  
                  if (itemsToSubmit.length === 0) return;
                  onAddItems(itemsToSubmit);
                  setBulkQuantities({});
                  setBulkMode(false);
                  
                  const successMsg = lang === "ur" 
                    ? "تمام منتخب کردہ اشیاء کامیابی سے کارٹ میں شامل کر دی گئیں!" 
                    : "All selected products successfully added to your cart!";
                  alert(successMsg);
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 select-none"
              >
                <span>📥</span>
                <span>{lang === "ur" ? `کارٹ میں شامل کریں (${selectedCount})` : `Add Selected to Cart (${selectedCount})`}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Universal Smart Search: Recipe Assistant Panel */}
      {isSmartSearching && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center animate-pulse flex flex-col items-center justify-center gap-3">
          <Sparkles className="text-purple-400 animate-spin" size={24} />
          <p className="text-sm text-purple-300 font-medium">
            {lang === "ur" ? "سمارٹ سرچ ترکیب کا تجزیہ کر رہی ہے..." : "Smart search is analyzing recipe ingredients..."}
          </p>
        </div>
      )}

      {!isSmartSearching && smartSearchResult && smartSearchResult.type === "recipe" && (
        <div className="bg-gradient-to-br from-purple-950/45 via-slate-900/40 to-emerald-950/30 backdrop-blur-xl border border-purple-500/25 rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/15 border border-purple-400/20 text-purple-300 rounded-2xl">
                <Sparkles size={24} className="animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                  {lang === "ur" ? "سمارٹ ترکیب اسسٹنٹ" : "Smart Recipe Assistant"}
                </span>
                <h3 className="text-xl md:text-2xl font-display font-bold text-white mt-1">
                  {lang === "ur" ? smartSearchResult.recipeNameUr || "ترکیب کے اجزاء" : smartSearchResult.recipeName}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const toAdd = smartSearchResult.recipeIngredients
                    .filter(ing => ing.matched && ing.productId)
                    .map(ing => ({
                      productId: ing.productId,
                      qty: ing.qty || 1,
                      name: ing.name,
                      nameUr: ing.nameUr,
                      price: ing.price,
                      action: "add"
                    }));

                  if (toAdd.length > 0) {
                    onAddItems(toAdd);
                    const msg = lang === "ur"
                      ? `ترکیب کے تمام ${toAdd.length} دستیاب اجزاء کارٹ میں شامل کر دیے گئے ہیں!`
                      : `Successfully added all ${toAdd.length} available ingredients for "${smartSearchResult.recipeName}" to your cart!`;
                    onNotify(msg, "success");
                  } else {
                    onNotify(lang === "ur" ? "کوئی دستیاب جزو نہیں ملا۔" : "No available store products found for this recipe.", "warning");
                  }
                }}
                className="px-5 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-purple-500/15 transition cursor-pointer active:scale-95 flex items-center gap-2 shrink-0"
              >
                <ShoppingCart size={14} />
                {lang === "ur" ? "تمام اجزاء شامل کریں" : "Add All to Cart"}
              </button>

              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-xs rounded-xl border border-white/5 transition cursor-pointer"
              >
                {lang === "ur" ? "بند کریں" : "Clear Search"}
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">
              {lang === "ur" ? "درکار پروڈکٹس اور دستیابی:" : "Required Products & Store Availability:"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smartSearchResult.recipeIngredients.map((ing, idx) => {
                const isMatched = ing.matched && ing.productId;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                      isMatched
                        ? "bg-white/5 border-emerald-500/20 hover:border-emerald-500/40"
                        : "bg-red-500/5 border-red-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg select-none ${
                        isMatched ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        {isMatched ? "✓" : "✗"}
                      </div>

                      <div>
                        <h5 className="font-bold text-sm text-white">
                          {lang === "ur" ? ing.nameUr : ing.name}
                        </h5>
                        <p className="text-xs text-white/50">
                          {ing.qty} {lang === "ur" ? ing.unitUr : ing.unit} • {ing.category}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {isMatched ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-bold text-purple-300">
                            {formatPrice(ing.price, currency)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onAddItems([{
                                productId: ing.productId,
                                qty: ing.qty || 1,
                                name: ing.name,
                                nameUr: ing.nameUr,
                                price: ing.price,
                                action: "add"
                              }]);
                              onNotify(
                                lang === "ur"
                                  ? `"${ing.nameUr}" کارٹ میں شامل ہو گیا!`
                                  : `"${ing.name}" added to cart!`,
                                "success"
                              );
                            }}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer"
                          >
                            {lang === "ur" ? "شامل کریں" : "Add this"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded-full">
                          {lang === "ur" ? "غیر دستیاب" : "Unavailable"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Grid Display */}
      {loadingItems ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 animate-pulse">
              <div className="w-24 h-24 bg-white/10 rounded-2xl mx-auto" />
              <div className="h-4 bg-white/10 rounded-md w-3/4 mx-auto" />
              <div className="h-3 bg-white/10 rounded-md w-1/2 mx-auto" />
              <div className="h-8 bg-white/5 rounded-xl w-full mt-auto" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center text-white/30 flex flex-col items-center justify-center gap-2">
          <span className="text-4xl text-white/10">🛍️</span>
          <h4 className="font-bold text-white mt-2 mb-1">{lang === "ur" ? "اس کیٹیگری میں کوئی پروڈکٹ نہیں ہے" : "Aisle Empty"}</h4>
          <p className="text-xs text-white/45">{lang === "ur" ? "پروڈکٹس لوڈ ہونے کا انتظار کریں یا ایڈمن پینل سے نیلا سامان شامل کریں۔" : "There are currently no products listed under this specific aisle yet."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredProducts.map((p) => {
            const isFav = favourites.includes(p.id);
            const inCart = cartItems.find((item) => String(item.productId) === String(p.id));
            const draftQty = bulkQuantities[p.id] || 0;

            const isImgUrl = typeof p.img === "string" && (p.img.startsWith("http://") || p.img.startsWith("https://") || p.img.startsWith("/"));

            return (
              <div
                key={p.id}
                className={`group relative bg-white/5 backdrop-blur-sm border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl overflow-hidden ${
                  bulkMode && draftQty > 0 
                    ? "border-amber-400/40 bg-amber-500/[0.02]" 
                    : "border-white/10 hover:border-purple-400/40"
                }`}
              >
                {/* Wishlist toggle heart button absolute */}
                <button
                  onClick={() => onToggleFavourite(p.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 hover:bg-purple-500 hover:text-slate-950 text-white/60 transition z-10 cursor-pointer"
                >
                  <Heart size={13} className={isFav ? "fill-red-500 text-red-500" : ""} />
                </button>

                {/* Packaging image & category */}
                <div className="flex flex-col items-center text-center mt-2 mb-4">
                  <div className="w-24 h-24 shrink-0 bg-white/5 border border-white/5 rounded-2xl mb-3 group-hover:scale-105 transition duration-300 select-none flex items-center justify-center overflow-hidden">
                    {isImgUrl ? (
                      <img 
                        src={p.img} 
                        alt={p.name} 
                        className="w-full h-full object-cover rounded-xl" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-4xl">{p.img || "🥛"}</span>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-purple-300 uppercase tracking-widest bg-purple-400/10 border border-purple-500/10 px-2.5 py-0.5 rounded-full">
                    {p.category}
                  </span>
                </div>

                {/* Core Title and pricing block */}
                <div className="text-center w-full mt-auto">
                  <h4 className="font-display font-bold text-sm text-white leading-tight group-hover:text-purple-300 transition-colors line-clamp-1">
                    {p.name}
                  </h4>
                  <h5 className="text-xs text-purple-300/60 line-clamp-1 mt-0.5 h-4 text-center" dir="rtl">
                    {p.nameUr}
                  </h5>
                  {p.price === 0 || p.status === "Inactive" || p.status === "Unavailable" || p.status?.toLowerCase() === "inactive" || p.status?.toLowerCase() === "unavailable" || p.stockQuantity <= 0 ? (
                    <div className="flex items-center justify-center bg-red-500/10 p-2.5 rounded-xl border border-red-500/20 w-full mt-2">
                      <span className="font-bold text-xs text-red-400">
                        {lang === "ur" ? "غیر دستیاب" : "Unavailable"}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="text-[11px] text-white/40 font-medium mb-3 mt-1">
                        per {lang === "ur" ? p.unitUr : p.unit}
                      </div>

                      {bulkMode ? (
                        /* Bulk Increment Buttons */
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between bg-slate-950/65 p-1 rounded-xl border border-white/5 w-full">
                            <button
                              type="button"
                              onClick={() => {
                                if (draftQty > 0) {
                                  setBulkQuantities({ ...bulkQuantities, [p.id]: draftQty - 1 });
                                }
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded font-bold text-xs text-white"
                            >
                              -
                            </button>
                            <span className="font-black text-xs text-amber-300 font-mono">
                              {draftQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setBulkQuantities({ ...bulkQuantities, [p.id]: draftQty + 1 });
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded font-bold text-xs text-white"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-[9px] text-amber-200/50 font-bold tracking-tight">
                            {lang === "ur" ? "بلک مقدار منتخب کریں" : "Set draft qty"}
                          </div>
                        </div>
                      ) : (
                        /* Simple add button */
                        <div className="flex items-center justify-between bg-slate-950/45 p-2 rounded-xl border border-white/5">
                          <div className="flex flex-col pl-1 items-start justify-center">
                            {p.salePrice && p.salePrice > 0 ? (
                              <>
                                <span className="font-bold text-[10px] text-white/40 line-through leading-none">
                                  {formatPrice(p.price, currency, lang, p.currencyCode)}
                                </span>
                                <span className="font-black text-xs text-emerald-400">
                                  {formatPrice(p.salePrice, currency, lang, p.currencyCode)}
                                </span>
                              </>
                            ) : (
                              <span className="font-bold text-sm text-purple-300">
                                {formatPrice(p.price, currency, lang, p.currencyCode)}
                              </span>
                            )}
                          </div>
                          
                          <button
                            onClick={() => onAddFromCatalog(p.id)}
                            className={`p-2 rounded-lg transition-all active:scale-95 cursor-pointer border ${
                              inCart
                                ? "bg-purple-500 border-purple-400 text-slate-950 font-bold"
                                : "bg-white/5 border-white/5 hover:border-purple-500/20 hover:bg-purple-500/10 text-white/70 hover:text-purple-300"
                            }`}
                            title="Add to active shopping cart"
                          >
                            {inCart ? (
                              <div className="flex items-center gap-1">
                                <ShoppingCart size={13} />
                                <span className="text-[10px] font-black">{inCart.qty}</span>
                              </div>
                            ) : (
                              <ShoppingCart size={13} />
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
