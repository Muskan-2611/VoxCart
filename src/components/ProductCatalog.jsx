import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { TRANSLATIONS, formatPrice } from "../utils/localizer";
import { Search, Heart, ShoppingCart, Sparkles, Send, Keyboard, ChevronDown, Check, ChevronLeft, ChevronRight, Plus, X, Tag, Package, Info, ShieldCheck } from "lucide-react";
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
  const [recipePersons, setRecipePersons] = useState(4);
  const [manualProductName, setManualProductName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [activeModalImage, setActiveModalImage] = useState(null);

  const handleAddManualProductToRecipe = () => {
    if (!manualProductName || !manualProductName.trim()) return;
    const queryTerm = manualProductName.trim().toLowerCase();
    
    // Find matching product in database
    const match = products.find(p => 
      p.name.toLowerCase().includes(queryTerm) || 
      (p.nameUr && p.nameUr.includes(queryTerm)) ||
      queryTerm.includes(p.name.toLowerCase())
    );

    const storeUnitPrice = match ? ((match.salePrice && match.salePrice > 0) ? match.salePrice : match.price) : 250;
    const unit = match ? match.unit : "pack";
    const unitUr = match ? match.unitUr : "پیکٹ";

    const newIng = {
      productId: match ? match.id : null,
      name: match ? match.name : manualProductName.trim(),
      nameUr: match ? match.nameUr : manualProductName.trim(),
      category: match ? match.category : "Pantry",
      price: storeUnitPrice,
      storeUnitPrice: storeUnitPrice,
      qty: unit === "g" || unit === "ml" ? 250 : 1,
      unit: unit,
      unitUr: unitUr,
      matched: !!match,
      currencyCode: match ? (match.currencyCode || match.currency || "PKR") : "PKR"
    };

    setSmartSearchResult(prev => {
      if (!prev || !prev.recipeIngredients) return prev;
      return {
        ...prev,
        recipeIngredients: [...prev.recipeIngredients, newIng]
      };
    });

    setManualProductName("");
    const msg = lang === "ur"
      ? `"${newIng.nameUr}" ریسپی کے اجزاء میں شامل کر دیا گیا!`
      : `Added "${newIng.name}" to recipe ingredients!`;
    onNotify(msg, "success");
  };

  // Sync recipePersons when new recipe is loaded
  useEffect(() => {
    if (smartSearchResult && smartSearchResult.type === "recipe") {
      const match = String(smartSearchResult.servings || "").match(/\d+/);
      setRecipePersons(match ? parseInt(match[0], 10) : 4);
    }
  }, [smartSearchResult]);

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
        if (response && response.type === "filter") {
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

  // Handle manual typing product phrases (e.g. "3 eggs, whole milk") or recipe queries
  const handleTypingSubmit = async (e) => {
    e.preventDefault();
    const cleanCmd = typedCommand.trim();
    if (!cleanCmd) return;

    setIsSmartSearching(true);

    // 1. Check if typed command is a clear cart command
    const parsed = parseVoiceCommand(cleanCmd, products);
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

    // 2. Perform smart search or recipe lookup without auto-adding to cart
    try {
      const response = await api.smartSearch(cleanCmd, lang);
      if (response && response.type === "filter") {
        setSmartSearchResult(response);
        setSearchTerm(cleanCmd);
      } else {
        setSearchTerm(cleanCmd);
        setSmartSearchResult(null);
      }
    } catch (err) {
      setSearchTerm(cleanCmd);
    }

    // 3. If in bulk mode and multi-items detected, pre-fill draft quantities so user can review/add
    if (parsed && parsed.action === "update_items" && parsed.items && parsed.items.length > 0) {
      const newBulkQty = { ...bulkQuantities };
      parsed.items.forEach(item => {
        if (item.productId && item.qty > 0) {
          newBulkQty[item.productId] = (newBulkQty[item.productId] || 0) + item.qty;
        }
      });
      setBulkQuantities(newBulkQty);
      if (!bulkMode) {
        setBulkMode(true);
      }
      const notifyMsg = lang === "ur"
        ? "اشیاء تلاش میں ملیں۔ مقدار چک کریں اور 'Add to Cart' پر کلک کریں۔"
        : "Products matched for review! Check quantities and click 'Add to Cart'.";
      if (onNotify) onNotify(notifyMsg, "info");
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
                    .map(([id, qty]) => ({ productId: isNaN(Number(id)) ? id : Number(id), qty, action: "add" }));
                  
                  if (itemsToSubmit.length === 0) return;
                  onAddItems(itemsToSubmit);
                  setBulkQuantities({});
                  setBulkMode(false);
                  
                  const successMsg = lang === "ur" 
                    ? "تمام منتخب کردہ اشیاء کامیابی سے کارٹ میں شامل کر دی گئیں!" 
                    : "All selected products successfully added to your cart!";
                  onNotify(successMsg, "success");
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

      {/* Universal Smart Search: Searching Products indicator */}
      {isSmartSearching && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center animate-pulse flex items-center justify-center gap-2">
          <Sparkles className="text-purple-400 animate-spin" size={18} />
          <p className="text-xs text-purple-300 font-medium">
            {lang === "ur" ? "مصنوعات کی تلاش جاری ہے..." : "Searching store catalog..."}
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

            {/* PERSONS / SERVINGS SCALER STEPPER */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-purple-950/60 border border-purple-500/30 px-3.5 py-1.5 rounded-2xl shadow-inner">
                <span className="text-xs font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1">
                  <span>👥</span>
                  <span>{lang === "ur" ? "افراد:" : "Persons:"}</span>
                </span>
                <div className="flex items-center gap-1 bg-slate-900/80 border border-purple-400/30 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setRecipePersons(p => Math.max(1, p - 1))}
                    className="w-7 h-7 flex items-center justify-center bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-lg text-sm font-bold transition active:scale-90 cursor-pointer select-none"
                    title={lang === "ur" ? "کم کریں" : "Decrease persons"}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-extrabold text-sm text-amber-300 select-none">
                    {recipePersons}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRecipePersons(p => p + 1)}
                    className="w-7 h-7 flex items-center justify-center bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-lg text-sm font-bold transition active:scale-90 cursor-pointer select-none"
                    title={lang === "ur" ? "زیادہ کریں" : "Increase persons"}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const basePersons = parseInt(smartSearchResult.servings) || 4;
                    const scale = recipePersons / basePersons;

                    const toAdd = [];
                    let unavailCount = 0;

                    smartSearchResult.recipeIngredients.forEach((ing, idx) => {
                      let matchedProd = null;
                      if (ing.productId) {
                        matchedProd = products.find(p => String(p.id) === String(ing.productId));
                      }
                      if (!matchedProd && ing.name) {
                        matchedProd = products.find(p => p.name.toLowerCase().includes(ing.name.toLowerCase()) || (ing.nameUr && p.nameUr && p.nameUr.includes(ing.nameUr)));
                      }

                      const isAvailable = !!(
                        matchedProd &&
                        matchedProd.status !== "Inactive" &&
                        matchedProd.status !== "Unavailable" &&
                        (matchedProd.stockQuantity === undefined || matchedProd.stockQuantity > 0) &&
                        matchedProd.price > 0 &&
                        ing.matched !== false
                      );

                      if (!isAvailable) {
                        unavailCount++;
                        return;
                      }

                      let rawBaseQty = (typeof ing.qty === "number" && ing.qty > 0) ? ing.qty : (parseFloat(ing.qty) || 1);
                      if (!rawBaseQty || rawBaseQty <= 0) rawBaseQty = 1;
                      let unit = ing.unit || (matchedProd ? matchedProd.unit : "pack");

                      if (unit === "g" || unit === "gram" || unit === "grams") {
                        if (rawBaseQty >= 10) rawBaseQty = rawBaseQty / 1000;
                        unit = "kg";
                      } else if (unit === "ml" || unit === "milliliter" || unit === "milliliters" || unit === "ملی لیٹر") {
                        if (rawBaseQty >= 10) rawBaseQty = rawBaseQty / 1000;
                        unit = "liter";
                      }

                      if ((unit === "piece" || unit === "pcs" || unit === "pack" || unit === "dozen" || unit === "bottle" || unit === "box" || unit === "unit") && rawBaseQty > 10) {
                        rawBaseQty = 2;
                      }

                      let scaledQty = Math.max(1, Math.round(rawBaseQty * scale));
                      if (!scaledQty || scaledQty <= 0) scaledQty = 1;
                      let storeCartQty = scaledQty;

                      let rawPrice = (matchedProd.salePrice && matchedProd.salePrice > 0) ? matchedProd.salePrice : matchedProd.price;
                      const storeUnitPrice = (rawPrice && rawPrice > 0) ? rawPrice : 280;

                      toAdd.push({
                        productId: matchedProd.id,
                        qty: storeCartQty,
                        name: matchedProd.name,
                        nameUr: matchedProd.nameUr,
                        price: storeUnitPrice,
                        currencyCode: matchedProd.currencyCode || matchedProd.currency || "PKR",
                        action: "add"
                      });
                    });

                    if (toAdd.length > 0) {
                      onAddItems(toAdd);
                      const recipeTitle = lang === "ur" ? (smartSearchResult.recipeNameUr || smartSearchResult.recipeName) : smartSearchResult.recipeName;
                      const msg = unavailCount > 0
                        ? (lang === "ur"
                            ? `ترکیب کے ${toAdd.length} دستیاب اجزاء کارٹ میں شامل کر دیے گئے۔ (${unavailCount} غیر دستیاب)`
                            : `Added ${toAdd.length} available ingredients for "${recipeTitle}" to cart. (${unavailCount} items Unavailable)`)
                        : (lang === "ur"
                            ? `ترکیب کے تمام ${toAdd.length} اجزاء (${recipePersons} افراد کے لیے) کارٹ میں شامل کر دیے گئے ہیں!`
                            : `Successfully added all ${toAdd.length} ingredients for "${recipeTitle}" (${recipePersons} persons) to your cart!`);
                      onNotify(msg, unavailCount > 0 ? "warning" : "success");
                    } else {
                      onNotify(lang === "ur" ? "ترکیب کے تمام اجزاء فی الحال غیر دستیاب ہیں۔" : "All required ingredients for this recipe are currently Unavailable.", "warning");
                    }
                  }}
                  className="px-5 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-purple-500/15 transition cursor-pointer active:scale-95 flex items-center gap-2 shrink-0"
                >
                  <ShoppingCart size={14} />
                  {lang === "ur" ? `تمام دستیاب اجزاء شامل کریں (${recipePersons} افراد)` : `Add Available (${recipePersons} persons)`}
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
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider">
                {lang === "ur"
                  ? `درکار تمام اجزاء (${smartSearchResult.recipeIngredients.length} آیتمز - ${recipePersons} افراد کے لیے مائیکرو اسکیلڈ):`
                  : `Complete Recipe Ingredients (${smartSearchResult.recipeIngredients.length} Items - Scaled for ${recipePersons} Persons):`}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smartSearchResult.recipeIngredients.map((ing, idx) => {
                let matchedProd = null;
                if (ing.productId) {
                  matchedProd = products.find(p => String(p.id) === String(ing.productId));
                }
                if (!matchedProd && ing.name) {
                  matchedProd = products.find(p => p.name.toLowerCase().includes(ing.name.toLowerCase()) || (ing.nameUr && p.nameUr && p.nameUr.includes(ing.nameUr)));
                }

                const isAvailable = !!(
                  matchedProd &&
                  matchedProd.status !== "Inactive" &&
                  matchedProd.status !== "Unavailable" &&
                  (matchedProd.stockQuantity === undefined || matchedProd.stockQuantity > 0) &&
                  matchedProd.price > 0 &&
                  ing.matched !== false
                );
                const resolvedProductId = isAvailable ? matchedProd.id : (idx + 1);

                const basePersons = parseInt(smartSearchResult.servings) || 4;
                const scale = recipePersons / basePersons;

                let rawBaseQty = (typeof ing.qty === "number" && ing.qty > 0) ? ing.qty : (parseFloat(ing.qty) || 1);
                if (!rawBaseQty || rawBaseQty <= 0) rawBaseQty = 1;
                let unit = isAvailable ? (ing.unit || matchedProd.unit || "pack") : (ing.unit || "pack");
                let unitUr = isAvailable ? (ing.unitUr || matchedProd.unitUr || "پیکٹ") : (ing.unitUr || "پیکٹ");

                // Convert grams to kg, and ml to liter for accurate pricing & display
                if (unit === "g" || unit === "gram" || unit === "grams") {
                  if (rawBaseQty >= 10) {
                    rawBaseQty = rawBaseQty / 1000;
                  }
                  unit = "kg";
                  unitUr = "کلو";
                } else if (unit === "ml" || unit === "milliliter" || unit === "milliliters" || unit === "ملی لیٹر") {
                  if (rawBaseQty >= 10) {
                    rawBaseQty = rawBaseQty / 1000;
                  }
                  unit = "liter";
                  unitUr = "لیٹر";
                }

                // Clamp unrealistically huge counts for discrete piece/pack units (e.g. prevent 500 onions)
                if ((unit === "piece" || unit === "pcs" || unit === "pack" || unit === "dozen" || unit === "bottle" || unit === "box" || unit === "unit") && rawBaseQty > 10) {
                  rawBaseQty = 2;
                }

                let scaledQty = Math.max(1, Math.round(rawBaseQty * scale));
                if (!scaledQty || scaledQty <= 0) scaledQty = 1;

                let rawPrice = isAvailable ? ((matchedProd.salePrice && matchedProd.salePrice > 0) ? matchedProd.salePrice : matchedProd.price) : 0;
                const storeUnitPrice = rawPrice;
                
                const scaledPortionPrice = Math.round((scaledQty * storeUnitPrice) * 100) / 100;

                let storeCartQty = scaledQty;

                const displayCat = isAvailable ? (matchedProd.category || "Pantry") : "Unavailable";

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                      isAvailable ? "bg-white/5 border-purple-500/20 hover:border-purple-500/40" : "bg-red-500/5 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold select-none shrink-0 ${
                        isAvailable ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"
                      }`}>
                        {idx + 1}
                      </div>

                      <div>
                        <h5 className={`font-bold text-sm ${isAvailable ? "text-white" : "text-white/80"}`}>
                          {lang === "ur" ? (ing.nameUr || ing.name) : ing.name}
                        </h5>
                        <p className="text-xs text-white/60">
                          {isAvailable ? (
                            <>
                              <span className="font-semibold text-purple-300">{scaledQty} {lang === "ur" ? unitUr : unit}</span> • {displayCat}
                            </>
                          ) : (
                            <span className="font-semibold text-red-400">{lang === "ur" ? "اسٹور میں موجود نہیں" : "Not in stock"}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isAvailable ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-bold text-purple-300">
                            {formatPrice(scaledPortionPrice, currency, lang, ing.currencyCode || (matchedProd ? matchedProd.currencyCode : "PKR"))}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onAddItems([{
                                productId: resolvedProductId,
                                qty: storeCartQty,
                                name: matchedProd ? matchedProd.name : ing.name,
                                nameUr: matchedProd ? matchedProd.nameUr : ing.nameUr,
                                price: storeUnitPrice,
                                currencyCode: matchedProd ? (matchedProd.currencyCode || matchedProd.currency || "PKR") : "PKR",
                                action: "add"
                              }]);
                              onNotify(
                                lang === "ur"
                                  ? `"${ing.nameUr || ing.name}" (${storeCartQty} ${unitUr}) کارٹ میں شامل ہو گیا!`
                                  : `"${ing.name}" (${storeCartQty} ${unit}) added to cart!`,
                                "success"
                              );
                            }}
                            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[11px] font-bold cursor-pointer transition border border-emerald-500/30 active:scale-95 flex items-center gap-1"
                          >
                            <ShoppingCart size={11} />
                            {lang === "ur" ? "شامل کریں" : "Add this"}
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-xs text-red-400 bg-red-500/20 px-2.5 py-1 rounded-xl border border-red-500/30 select-none">
                          {lang === "ur" ? "غیر دستیاب" : "Unavailable"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MANUAL PRODUCT ADDITION TO RECIPE */}
            <div className="mt-6 pt-5 border-t border-purple-500/20 flex flex-col md:flex-row items-center gap-3">
              <div className="flex-1 w-full relative">
                <input
                  type="text"
                  value={manualProductName}
                  onChange={(e) => setManualProductName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddManualProductToRecipe();
                    }
                  }}
                  placeholder={lang === "ur" ? "پروڈکٹس اور ترکیبات خود سے یہاں شامل کریں (مثال: ادرک، بریانی، کریم)..." : "Manually add products or recipes here (e.g. Garlic, Biryani, Cream)..."}
                  className="w-full bg-slate-900/90 border border-purple-500/30 rounded-2xl px-4 py-2.5 text-xs md:text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                />
              </div>
              <button
                type="button"
                onClick={handleAddManualProductToRecipe}
                className="w-full md:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-2xl transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-emerald-500/15"
              >
                <Plus size={16} />
                {lang === "ur" ? "پروڈکٹ شامل کریں" : "Add Product to Recipe"}
              </button>
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
                onClick={() => {
                  setSelectedProduct(p);
                  setModalQty(1);
                  setActiveModalImage(null);
                }}
                className={`group relative bg-white/5 backdrop-blur-sm border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl overflow-hidden cursor-pointer ${
                  bulkMode && draftQty > 0 
                    ? "border-amber-400/40 bg-amber-500/[0.02]" 
                    : "border-white/10 hover:border-purple-400/40"
                }`}
              >
                {/* Wishlist toggle heart button absolute */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavourite(p.id);
                  }}
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
                        /* Bulk Increment Buttons & Numeric Input */
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between bg-slate-950/65 p-1 rounded-xl border border-white/5 w-full">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (draftQty > 0) {
                                  setBulkQuantities({ ...bulkQuantities, [p.id]: draftQty - 1 });
                                }
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded font-bold text-xs text-white shrink-0 cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={draftQty === 0 ? "" : draftQty}
                              placeholder="0"
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                const val = parseInt(e.target.value);
                                setBulkQuantities({ ...bulkQuantities, [p.id]: isNaN(val) ? 0 : Math.max(0, val) });
                              }}
                              className="w-12 text-center font-black text-xs text-amber-300 font-mono bg-transparent border-none outline-none p-0 focus:text-white"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBulkQuantities({ ...bulkQuantities, [p.id]: draftQty + 1 });
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded font-bold text-xs text-white shrink-0 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-[9px] text-amber-200/50 font-bold tracking-tight">
                            {lang === "ur" ? "بلک مقدار درج کریں" : "Enter or edit qty"}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddFromCatalog(p.id);
                            }}
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

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="relative bg-slate-900 border border-purple-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 text-white shadow-2xl shadow-purple-950/50 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-purple-500 hover:text-slate-950 text-white/70 transition cursor-pointer z-10"
              title="Close modal"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Image Gallery */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-full aspect-square bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden relative shadow-inner">
                  {(() => {
                    const displayImg = activeModalImage || selectedProduct.img;
                    const isImgUrl = typeof displayImg === "string" && (displayImg.startsWith("http://") || displayImg.startsWith("https://") || displayImg.startsWith("/"));
                    if (isImgUrl) {
                      return (
                        <img
                          src={displayImg}
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      );
                    }
                    return <span className="text-6xl">{displayImg || "🥛"}</span>;
                  })()}

                  {/* Wishlist heart button over image */}
                  <button
                    onClick={() => onToggleFavourite(selectedProduct.id)}
                    className="absolute top-3 left-3 p-2 rounded-full bg-slate-950/70 hover:bg-purple-500 text-white transition cursor-pointer"
                    title="Toggle Wishlist"
                  >
                    <Heart 
                      size={16} 
                      className={favourites.includes(selectedProduct.id) ? "fill-red-500 text-red-500" : ""} 
                    />
                  </button>
                </div>

                {/* Thumbnail strip if gallery images exist */}
                {Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 overflow-x-auto w-full pb-1">
                    <button
                      onClick={() => setActiveModalImage(selectedProduct.img)}
                      className={`w-12 h-12 rounded-xl border overflow-hidden shrink-0 cursor-pointer ${
                        (!activeModalImage || activeModalImage === selectedProduct.img) 
                          ? "border-purple-400 ring-2 ring-purple-400/40" 
                          : "border-white/10 opacity-60 hover:opacity-100"
                      }`}
                    >
                      {typeof selectedProduct.img === "string" && (selectedProduct.img.startsWith("http") || selectedProduct.img.startsWith("/")) ? (
                        <img src={selectedProduct.img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg flex items-center justify-center h-full">{selectedProduct.img || "🥛"}</span>
                      )}
                    </button>
                    {selectedProduct.images.map((imgObj, idx) => {
                      const imgUrl = typeof imgObj === "string" ? imgObj : imgObj.url;
                      if (!imgUrl) return null;
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveModalImage(imgUrl)}
                          className={`w-12 h-12 rounded-xl border overflow-hidden shrink-0 cursor-pointer ${
                            activeModalImage === imgUrl 
                              ? "border-purple-400 ring-2 ring-purple-400/40" 
                              : "border-white/10 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Product Information */}
              <div className="md:col-span-7 flex flex-col justify-between h-full">
                <div>
                  {/* Badges: Category, Subcategory, Stock */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
                      {selectedProduct.category || "Grocery"}
                    </span>
                    {selectedProduct.subcategory && (
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                        {selectedProduct.subcategory}
                      </span>
                    )}
                    {selectedProduct.price === 0 || selectedProduct.status === "Inactive" || selectedProduct.status === "Unavailable" || selectedProduct.status?.toLowerCase() === "inactive" || selectedProduct.status?.toLowerCase() === "unavailable" || selectedProduct.stockQuantity <= 0 ? (
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                        {lang === "ur" ? "غیر دستیاب" : "Unavailable"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        {lang === "ur" ? "دستیا ب" : "In Stock"} {selectedProduct.stockQuantity ? `(${selectedProduct.stockQuantity})` : ""}
                      </span>
                    )}
                  </div>

                  {/* Titles */}
                  <h3 className="font-display font-bold text-xl md:text-2xl text-white leading-tight">
                    {selectedProduct.name}
                  </h3>
                  {selectedProduct.nameUr && (
                    <h4 className="text-sm font-medium text-purple-300/80 mt-0.5" dir="rtl">
                      {selectedProduct.nameUr}
                    </h4>
                  )}

                  {/* Price Banner */}
                  <div className="mt-4 p-3 bg-white/5 border border-white/5 rounded-2xl flex items-baseline gap-3">
                    {selectedProduct.salePrice && selectedProduct.salePrice > 0 ? (
                      <>
                        <span className="font-black text-2xl text-emerald-400">
                          {formatPrice(selectedProduct.salePrice, currency, lang, selectedProduct.currencyCode)}
                        </span>
                        <span className="font-bold text-sm text-white/40 line-through">
                          {formatPrice(selectedProduct.price, currency, lang, selectedProduct.currencyCode)}
                        </span>
                      </>
                    ) : (
                      <span className="font-black text-2xl text-purple-300">
                        {formatPrice(selectedProduct.price || 0, currency, lang, selectedProduct.currencyCode)}
                      </span>
                    )}
                    <span className="text-xs text-white/50 font-medium">
                      / {lang === "ur" ? (selectedProduct.unitUr || selectedProduct.unit) : selectedProduct.unit || "item"}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="mt-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-purple-300/70 mb-1">
                      {lang === "ur" ? "مصنوعات کی تفصیلات" : "Product Description"}
                    </h5>
                    <p className="text-xs md:text-sm text-white/80 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-white/5 whitespace-pre-line">
                      {lang === "ur" 
                        ? (selectedProduct.descriptionUr || selectedProduct.description || "اسٹور کیٹلاگ سے تازہ اور اعلیٰ کوالٹی پروڈکٹ۔") 
                        : (selectedProduct.description || selectedProduct.descriptionUr || "Fresh, high-quality product carefully selected for your daily needs.")
                      }
                    </p>
                  </div>

                  {/* Additional Metadata */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-white/60">
                    {selectedProduct.sku && (
                      <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                        <span className="font-semibold text-white/40 block">SKU / Code:</span>
                        <span className="font-mono text-white/90">{selectedProduct.sku}</span>
                      </div>
                    )}
                    {selectedProduct.brand && (
                      <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                        <span className="font-semibold text-white/40 block">Brand:</span>
                        <span className="text-white/90">{selectedProduct.brand}</span>
                      </div>
                    )}
                    {selectedProduct.batchNumber && (
                      <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                        <span className="font-semibold text-white/40 block">Batch No:</span>
                        <span className="font-mono text-white/90">{selectedProduct.batchNumber}</span>
                      </div>
                    )}
                    {selectedProduct.expiryDate && (
                      <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                        <span className="font-semibold text-white/40 block">Expiry Date:</span>
                        <span className="text-amber-300/90">{selectedProduct.expiryDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cart Control & Action */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-white/10 shrink-0">
                    <button
                      type="button"
                      onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                      className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-white font-bold cursor-pointer transition"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-mono font-bold text-sm text-purple-300">
                      {modalQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalQty(modalQty + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-white font-bold cursor-pointer transition"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const activePrice = (selectedProduct.salePrice && selectedProduct.salePrice > 0) ? selectedProduct.salePrice : selectedProduct.price;
                      if (onAddItems) {
                        onAddItems([{
                          productId: selectedProduct.id,
                          name: selectedProduct.name,
                          nameUr: selectedProduct.nameUr || selectedProduct.name,
                          category: selectedProduct.category,
                          price: activePrice,
                          qty: modalQty,
                          unit: selectedProduct.unit,
                          unitUr: selectedProduct.unitUr || selectedProduct.unit,
                          currencyCode: selectedProduct.currencyCode || selectedProduct.currency || "PKR"
                        }]);
                      } else if (onAddFromCatalog) {
                        for (let i = 0; i < modalQty; i++) {
                          onAddFromCatalog(selectedProduct.id);
                        }
                      }
                      if (onNotify) {
                        onNotify(
                          lang === "ur"
                            ? `${selectedProduct.nameUr || selectedProduct.name} (${modalQty}) کارٹ میں شامل کر دیا گیا`
                            : `Added ${modalQty} x ${selectedProduct.name} to cart!`,
                          "success"
                        );
                      }
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.price === 0 || selectedProduct.status === "Inactive" || selectedProduct.status === "Unavailable" || selectedProduct.status?.toLowerCase() === "inactive" || selectedProduct.status?.toLowerCase() === "unavailable"}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer transition active:scale-[0.98]"
                  >
                    <ShoppingCart size={16} />
                    <span>
                      {lang === "ur" ? "کارٹ میں شامل کریں" : "Add to Cart"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
