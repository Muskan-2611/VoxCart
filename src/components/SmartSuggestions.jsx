import React from "react";
import { Sparkles, Calendar, RotateCcw, Plus, ShoppingBag, Eye, HelpCircle, Trash2 } from "lucide-react";
import { formatPrice } from "../utils/localizer";

export default function SmartSuggestions({
  lang,
  currency,
  orders = [],
  products = [],
  onAddProduct,
  onAddMultipleProducts,
  onClearLastVoiceAction,
  lastVoiceAddedCount = 0
}) {
  const isUr = lang === "ur";

  // Localized string dictionary for SmartSuggestions UI
  const labels = {
    title: isUr ? "ذاتی خریداری اسسٹنٹ" : "Shopping Insights & AI Recs",
    subtitle: isUr ? "سابقہ آرڈرز اور سمارٹ سفارشات" : "User purchase history & smart suggestions",
    lastBoughtTitle: isUr ? "آپ کی سابقہ خریداری کی ہسٹری" : "Your Purchase History",
    noLastBought: isUr ? "ابھی تک کوئی آرڈر نہیں کیا گیا" : "No purchase history yet",
    noLastBoughtDesc: isUr ? "اپنا پہلا آرڈر صوتی اسسٹنٹ یا دکان سے مکمل کریں!" : "Place your first voice or manual order to generate custom insight logs.",
    reorderSuccess: isUr ? "آخری آرڈر کی تمام مصنوعات شامل کر دی گئیں!" : "Readded last order items to your active cart!",
    suggestedTitle: isUr ? "آپ کے لیے بہترین تجاویز" : "Smart Suggestions For You",
    suggestedDesc: isUr ? "آپ کی کثرت پسند خریداری کے مطابق تجویز کردہ اشیاء:" : "Scored by your purchase frequencies and catalog trends:",
    addCart: isUr ? "شامل کریں" : "Add to Cart",
    boughtOn: isUr ? "خریداری کی تاریخ:" : "Purchased on:",
    clearVoiceTitle: isUr ? "غلط آواز کے نتائج منسوخ کریں؟" : "Incorrect Voice Input?",
    clearVoiceBtn: isUr ? "نتائج صاف کریں" : "Clear Voice Results"
  };

  // 1. Get the last order
  const lastOrder = orders && orders.length > 0 ? orders[0] : null;

  const [showAllHistory, setShowAllHistory] = React.useState(false);

  // Extract all unique products purchased across ALL historic orders and aggregate quantities
  const historicalProducts = React.useMemo(() => {
    if (!orders || orders.length === 0) return [];
    const bMap = {};
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          if (!item) return;
          
          // Find standard product to resolve any ID/name mismatches
          const matchingProduct = products.find(p => 
            (p.id && item.productId && String(p.id) === String(item.productId)) ||
            (p.name && item.name && p.name.toLowerCase().trim() === item.name.toLowerCase().trim())
          );
          
          const standardId = matchingProduct ? String(matchingProduct.id) : (item.productId ? String(item.productId) : (item.name || "").toLowerCase().trim());
          
          if (bMap[standardId]) {
            bMap[standardId].qty += (item.qty || 1);
          } else {
            bMap[standardId] = { 
              productId: matchingProduct ? matchingProduct.id : item.productId,
              name: matchingProduct ? matchingProduct.name : (item.name || "Unknown Product"),
              nameUr: matchingProduct ? matchingProduct.nameUr : (item.nameUr || item.name || "Unknown Product"),
              price: matchingProduct ? matchingProduct.price : (typeof item.price === "number" ? item.price : 1.99),
              qty: typeof item.qty === "number" ? item.qty : 1,
              img: matchingProduct ? matchingProduct.img : (item.img || "📦"),
              currencyCode: item.currencyCode || order.currency || "USD"
            };
          }
        });
      }
    });
    return Object.values(bMap);
  }, [orders, products]);

  // 2. Compute category frequency across ALL historic orders
  const boughtCategories = React.useMemo(() => {
    if (!orders || orders.length === 0) return {};
    const freq = {};
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const matchingProd = products.find(p => p.id === item.productId || p.name === item.name);
          const cat = matchingProd?.category || item.category || "General";
          freq[cat] = (freq[cat] || 0) + item.qty;
        });
      }
    });
    return freq;
  }, [orders, products]);

  // Generate highly personalized suggested products sorted by user purchase weights
  const suggestedProducts = React.useMemo(() => {
    if (!products || products.length === 0) return [];

    // Score all products based on user category frequency
    const list = products.map(p => {
      const parentScore = boughtCategories[p.category] || 0;
      // Small penalty or tie-breaker for already in last order to keep things fresh
      const isInLastOrder = lastOrder && lastOrder.items?.some(item => String(item.productId) === String(p.id));
      const score = parentScore - (isInLastOrder ? 1.5 : 0);
      return { product: p, score };
    });

    // Sort descending by calculated interest scores
    list.sort((a, b) => b.score - a.score);

    // Pick top unique suggestions, fallbacks automatically filled by default sort
    return list.slice(0, 4).map(item => item.product);
  }, [products, boughtCategories, lastOrder]);

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-white flex flex-col gap-4 shadow-xl">
      {/* Widget Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-medium text-base text-white flex items-center gap-2">
            <Sparkles className="text-amber-400 size-4.5 animate-pulse" />
            <span>{labels.title}</span>
          </h3>
          <p className="text-[11px] text-white/45 mt-0.5 leading-tight">
            {labels.subtitle}
          </p>
        </div>
      </div>

      {/* REACTION: CLEAR LAST VOICE INPUT RESULTS */}
      {lastVoiceAddedCount > 0 && onClearLastVoiceAction && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div>
            <h5 className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 leading-tight">
              <span>⚠️ {labels.clearVoiceTitle}</span>
            </h5>
            <p className="text-[9.5px] text-white/60 mt-0.5">
              {isUr 
                ? `آخری صوتی ریکارڈ سے شامل کردہ چیزیں (${lastVoiceAddedCount} اشیاء) سیکنڈوں میں ختم کریں۔` 
                : `Instantly remove the ${lastVoiceAddedCount} products added by your last voice command.`}
            </p>
          </div>
          <button
            onClick={onClearLastVoiceAction}
            className="shrink-0 bg-transparent hover:bg-amber-500/20 text-amber-200 border border-amber-400/40 hover:border-amber-400 text-[10px] font-bold py-1.5 px-2.5 rounded-lg active:scale-95 transition cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Trash2 size={11} />
            <span>{labels.clearVoiceBtn}</span>
          </button>
        </div>
      )}

      {/* SECTION 1: WHAT THEY BOUGHT LAST TIME */}
      <div className="bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
            <span>{labels.lastBoughtTitle}</span>
          </h4>
          {orders && orders.length > 0 && (
            <button
              onClick={() => setShowAllHistory(!showAllHistory)}
              className="text-[10px] text-purple-400 hover:text-purple-300 font-bold bg-purple-500/10 hover:bg-purple-500/20 px-2 py-1 rounded transition border border-purple-500/20"
              id="btn-toggle-show-all-history"
            >
              {showAllHistory 
                ? (isUr ? "آخری آرڈر دکھائیں" : "Show Last Order") 
                : (isUr ? "تمام سابقہ اشیاء دکھائیں" : "Show All")}
            </button>
          )}
        </div>

        {orders && orders.length > 0 ? (
          <div className="flex flex-col gap-3">
            {/* items list */}
            <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
              {(showAllHistory ? historicalProducts : (lastOrder?.items || [])).map((item, index) => {
                const isUrl = typeof item.img === "string" && (item.img.startsWith("http") || item.img.startsWith("/"));
                return (
                  <div key={index} className="flex items-center justify-between text-xs bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0 select-none">
                        {isUrl ? <img src={item.img} className="w-5 h-5 object-contain rounded" alt="" /> : (item.img || "📦")}
                      </span>
                      <span className="font-medium">
                        {isUr ? item.nameUr : item.name}
                      </span>
                      <span className="text-purple-300 font-bold bg-purple-500/10 px-1.5 py-0.2 rounded font-mono">
                        {item.qty}x
                      </span>
                    </div>
                    <span className="font-semibold text-white/90">
                      {showAllHistory 
                        ? `${formatPrice(item.price, currency, lang, item.currencyCode)}`
                        : formatPrice(item.price * item.qty, currency, lang, item.currencyCode)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 flex flex-col items-center justify-center text-white/30 gap-1.5">
            <ShoppingBag size={24} className="opacity-20" />
            <p className="text-xs font-bold text-white/50">{labels.noLastBought}</p>
            <p className="text-[10px] text-white/30 max-w-[200px] leading-relaxed">{labels.noLastBoughtDesc}</p>
          </div>
        )}
      </div>

      {/* SECTION 2: SUGGESTED PRODUCTS FOR NOW */}
      <div className="flex flex-col gap-2.5">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            {labels.suggestedTitle}
          </h4>
          <p className="text-[10px] text-white/45 mt-0.5 leading-relaxed">
            {labels.suggestedDesc}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {suggestedProducts.map((p) => {
            const isUrl = typeof p.img === "string" && (p.img.startsWith("http") || p.img.startsWith("/"));
            return (
              <div
                key={p.id}
                className="bg-white/5 border border-white/5 hover:border-purple-400/25 rounded-xl p-3 flex flex-col justify-between gap-2.5 transition group"
              >
                {/* Product Metadata */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] text-white/35 font-semibold bg-white/5 border border-white/5 rounded px-1.5 py-0.2 uppercase font-mono tracking-wider">
                      {p.category}
                    </span>
                    <span className="text-base shrink-0 select-none">
                      {isUrl ? <img src={p.img} className="w-5 h-5 object-contain rounded" alt="" /> : (p.img || "📦")}
                    </span>
                  </div>
                  
                  <h5 className="font-semibold text-xs leading-tight line-clamp-1 group-hover:text-purple-300 transition duration-200 text-white/90">
                    {p.name}
                  </h5>
                  <h5 className="text-[10px] text-white/60 line-clamp-1">
                    {p.nameUr}
                  </h5>
                </div>

                {p.price === 0 || p.status === "Inactive" || p.status === "Unavailable" || p.status?.toLowerCase() === "inactive" || p.status?.toLowerCase() === "unavailable" || p.stockQuantity <= 0 ? (
                  <div className="flex items-center justify-center bg-red-500/10 p-2 rounded-lg border border-red-500/20 w-full">
                    <span className="font-bold text-[11px] text-red-400">
                      {isUr ? "غیر دستیاب" : "Unavailable"}
                    </span>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] text-white/40 font-mono">
                      {formatPrice(p.price, currency, lang, p.currencyCode)} / {isUr ? (p.unitUr || "عدد") : (p.unit || "item")}
                    </p>

                    {/* Quick Add button */}
                    <button
                      type="button"
                      onClick={() => onAddProduct(p.id, 1)}
                      className="w-full bg-white/5 hover:bg-purple-500 hover:text-slate-950 font-bold text-[10px] py-1.5 px-2 rounded-lg transition-all border border-white/10 hover:border-purple-500 active:scale-95 flex items-center justify-center gap-1 cursor-pointer select-none"
                    >
                      <Plus size={10} />
                      <span>{labels.addCart}</span>
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
