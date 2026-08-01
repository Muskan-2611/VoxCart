import React from "react";
import { TRANSLATIONS, formatPrice, formatDateTime, convertPrice } from "../utils/localizer";
import { Trash2, AlertTriangle, Printer, ShoppingBag, Plus, Minus } from "lucide-react";

export default function CartSidebar({
  lang,
  currency,
  cartItems,
  onUpdateQty,
  onClearCart,
  onCheckout,
  isOnline,
  products
}) {
  const t = TRANSLATIONS[lang];

  // Resolve details of cart item products directly from parent inventory
  const resolvedItems = cartItems.map(item => {
    const p = products.find(prod => String(prod.id) === String(item.productId));
    const isUnavail = p ? (
      p.price === 0 || 
      p.status === "Inactive" || 
      p.status === "Unavailable" || 
      p.status?.toLowerCase() === "inactive" || 
      p.status?.toLowerCase() === "unavailable" || 
      p.stockQuantity <= 0
    ) : true;
    return {
      ...item,
      product: p ? { ...p, isUnavailable: isUnavail } : { 
        name: item.name || "Unavailable Product", 
        nameUr: item.nameUr || "غیر دستیاب مصنوعات", 
        price: 0, 
        img: "📦", 
        category: "General", 
        unit: "item", 
        unitUr: "عدد",
        isUnavailable: true 
      }
    };
  });

  const getProductPrice = (prod) => {
    return (prod.salePrice && prod.salePrice > 0) ? prod.salePrice : prod.price;
  };

  const subtotalUsd = resolvedItems.reduce((sum, item) => {
    const activePrice = getProductPrice(item.product);
    const itemPriceInUsd = convertPrice(activePrice, item.product.currencyCode || "USD", "USD");
    return sum + (itemPriceInUsd * item.qty);
  }, 0);
  const taxUsd = subtotalUsd * 0.05;
  const totalUsd = subtotalUsd + taxUsd;

  const handleCheckoutClick = () => {
    if (!isOnline) {
      alert(t.offlineWarning);
      return;
    }
    if (resolvedItems.length === 0) return;
    onCheckout({
      items: resolvedItems.map(item => {
        const activePrice = getProductPrice(item.product);
        return {
          id: item.productId,
          name: item.product.name,
          nameUr: item.product.nameUr,
          category: item.product.category,
          qty: item.qty,
          price: activePrice,
          currencyCode: item.product.currencyCode || "USD",
          unit: item.product.unit,
          unitUr: item.product.unitUr,
          total: activePrice * item.qty,
          img: item.product.img
        };
      }),
      subtotal: subtotalUsd,
      tax: taxUsd,
      total: totalUsd,
      currency: currency
    });
  };

  // Generate printable web invoice receipt dynamically on click
  const handlePrintReceipt = () => {
    if (resolvedItems.length === 0) return;
    const datetimeStr = formatDateTime(new Date());
    
    // Set localized variables
    const isUr = lang === "ur";
    const receiptTitle = isUr ? "رسید کی تفصیلات - ووکس کارٹ" : "VoxCart Receipt";
    const appTitle = isUr ? "🛒 ووکس کارٹ" : "🛒 VoxCart";
    const appSub = isUr ? "انوائس رسید · صوتی اسسٹنٹ سے لیس سمارٹ خریداری" : "Invoice Receipt · Powered by AI Voice";
    const labelDate = isUr ? "آرڈر کی تاریخ:" : "Date:";
    const labelCurrency = isUr ? "کرنسی منتخب:" : "Currency:";
    const colProduct = isUr ? "مصنوعات" : "Product";
    const colQty = isUr ? "تعداد / فی قیمت" : "Qty";
    const colTotal = isUr ? "کل قیمت" : "Total";
    const labelSubtotal = isUr ? "سب ٹوٹل:" : "Subtotal:";
    const labelTax = isUr ? "ٹیکس (5%):" : "Tax (5%):";
    const labelGrandTotal = isUr ? "حتمی قیمت:" : "Grand Total:";
    const labelThankYou = isUr ? "ووکس کارٹ پر خریداری کے لیے آپ کا شکریہ!" : "Thank you for shopping on VoxCart!";
    const labelDisclaimer = isUr ? "ڈائنامک انوائس رسید پی ڈی ایف - آف لائن محفوظ" : "Dynamic Invoice PDF/Printer Setup Offline Safe";

    let invoiceHtml = `
      <html>
      <head>
        <title>${receiptTitle}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 30px; color: #333; max-width: 600px; margin: 0 auto; background: #fafafa; direction: ${isUr ? 'rtl' : 'ltr'}; text-align: ${isUr ? 'right' : 'left'}; }
          .receipt { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eee; }
          .header { text-align: center; margin-bottom: 24px; border-bottom: 2px dashed #ddd; padding-bottom: 20px; }
          .header h1 { font-size: 26px; margin: 0; color: #5a52d5; }
          .header p { margin: 4px 0 0; color: #777; font-size: 13px; }
          .meta { font-size: 13px; color: #555; display: flex; justify-content: space-between; margin-bottom: 16px; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { border-bottom: 2px solid #eee; padding: 10px 4px; text-align: ${isUr ? 'right' : 'left'}; font-size: 12px; color: #888; text-transform: uppercase; }
          td { padding: 12px 4px; border-bottom: 1px solid #f5f5f5; font-size: 14px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #555; }
          .grand-total { font-size: 20px; font-weight: bold; color: #000; border-top: 2px solid #5a52d5; padding-top: 12px; margin-top: 8px; }
          .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
          @media print { body { background: white; padding: 0; } .receipt { box-shadow: none; border: none; } }
          .item-visual { width: 24px; height: 24px; object-fit: cover; border-radius: 4px; display: inline-block; vertical-align: middle; margin-${isUr ? 'left' : 'right'}: 6px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>${appTitle}</h1>
            <p>${appSub}</p>
          </div>
          <div class="meta">
            <span>${labelDate} ${datetimeStr}</span>
            <span>${labelCurrency} ${currency}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>${colProduct}</th>
                <th>${colQty}</th>
                <th style="text-align: ${isUr ? 'left' : 'right'};">${colTotal}</th>
              </tr>
            </thead>
            <tbody>
              ${resolvedItems.map(item => {
                const isUrl = typeof item.product.img === "string" && (item.product.img.startsWith("http") || item.product.img.startsWith("/"));
                const visualTag = isUrl 
                  ? `<img src="${item.product.img}" class="item-visual" />`
                  : `<span>${item.product.img || "📦"}</span>`;
                return `
                  <tr>
                    <td>${visualTag} ${isUr ? item.product.nameUr : item.product.name}</td>
                    <td>${item.qty} × ${formatPrice(getProductPrice(item.product), currency, lang, item.product.currencyCode)}</td>
                    <td style="text-align: ${isUr ? 'left' : 'right'}; font-weight: 600;">${formatPrice(getProductPrice(item.product) * item.qty, currency, lang, item.product.currencyCode)}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
          <div class="total-row">
            <span>${labelSubtotal}</span>
            <span>${formatPrice(subtotalUsd, currency, lang, "USD")}</span>
          </div>
          <div class="total-row">
            <span>${labelTax}</span>
            <span>${formatPrice(taxUsd, currency, lang, "USD")}</span>
          </div>
          <div class="total-row grand-total">
            <span>${labelGrandTotal}</span>
            <span>${formatPrice(totalUsd, currency, lang, "USD")}</span>
          </div>
          <div class="footer">
            <p>${labelThankYou}</p>
            <p style="font-size: 12px; font-weight: bold; margin-top: 4px; color: #5a52d5;">Managed By Team MLT</p>
            <p style="font-size: 11px; margin-top: 4px;">${labelDisclaimer}</p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
    }
  };

  return (
    <div className="glass-panel border border-white/10 rounded-3xl p-6 flex flex-col justify-between h-[520px] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
          <span>🛒</span>
          <span>{t.cartTitle}</span>
          <span className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full font-black border border-purple-500/30 shadow-sm">
            {resolvedItems.length}
          </span>
        </h3>
        {resolvedItems.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-gray-400 hover:text-red-400 transition flex items-center gap-1 text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Cart Content Items list */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-none">
        {resolvedItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 px-4">
            <ShoppingBag size={48} className="mb-3 text-purple-400/20 animate-pulse" />
            <p className="text-xs font-semibold tracking-wide leading-relaxed">{t.cartEmpty}</p>
          </div>
        ) : (
          resolvedItems.map((item, index) => {
            const isImgUrl = typeof item.product.img === "string" && (item.product.img.startsWith("http://") || item.product.img.startsWith("https://") || item.product.img.startsWith("/"));
            return (
              <div
                key={index}
                className="flex items-center justify-between gap-3 p-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl border border-white/10 hover:border-purple-400/30 transition-all shadow-sm"
               >
                {/* Product Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 shrink-0 bg-slate-900 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
                    {isImgUrl ? (
                      <img 
                        src={item.product.img} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-xl">{item.product.img || "🥛"}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-white truncate">
                      {lang === "ur" ? item.product.nameUr : item.product.name}
                    </div>
                    <div className="text-xs text-gray-400 font-medium">
                      {item.product.isUnavailable ? (
                        <span className="text-red-400 font-bold">{lang === "ur" ? "غیر دستیاب" : "Unavailable"}</span>
                      ) : (
                        `${formatPrice(getProductPrice(item.product), currency, lang, item.product.currencyCode)} / ${lang === "ur" ? item.product.unitUr : item.product.unit}`
                      )}
                    </div>
                  </div>
                </div>

                {/* Incrementor triggers */}
                <div className="flex items-center gap-2.5">
                  {item.product.isUnavailable ? (
                    <span className="font-bold text-xs text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-xl border border-red-500/20 select-none shrink-0">
                      {lang === "ur" ? "غیر دستیاب" : "Unavailable"}
                    </span>
                  ) : (
                    <>
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 shrink-0">
                        <button
                          onClick={() => onUpdateQty(item.productId, item.qty - 1)}
                          className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer active:scale-90"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-xs text-white font-black w-6 text-center select-none">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => onUpdateQty(item.productId, item.qty + 1)}
                          className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer active:scale-90"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <div className="text-right shrink-0 min-w-[65px]">
                        <div className="font-bold text-sm text-purple-300">
                          {formatPrice(getProductPrice(item.product) * item.qty, currency, lang, item.product.currencyCode)}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Delete/Remove option */}
                  <button
                    onClick={() => onUpdateQty(item.productId, 0)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition cursor-pointer shrink-0 active:scale-90"
                    title={lang === "ur" ? "کارٹ سے خارج کریں" : "Remove item"}
                    id={`btn-remove-item-${item.productId}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bill summary receipts */}
      {resolvedItems.length > 0 && (
        <div className="border-t border-white/10 pt-4 mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-2 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>{t.cartSubtotal}</span>
              <span className="text-white font-semibold">{formatPrice(subtotalUsd, currency, lang, "USD")}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span>{t.cartTax}</span>
              <span className="text-white font-semibold">{formatPrice(taxUsd, currency, lang, "USD")}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-1">
              <span>{t.cartTotal}</span>
              <span className="text-purple-300 font-extrabold text-lg">
                {formatPrice(totalUsd, currency, lang, "USD")}
              </span>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={handlePrintReceipt}
              className="bg-white/5 hover:bg-white/10 text-white p-3.5 rounded-2xl border border-white/10 cursor-pointer active:scale-95 transition hover:border-purple-500/30 shadow-sm"
              title={t.receiptDownload}
            >
              <Printer size={18} />
            </button>
            <button
              onClick={handleCheckoutClick}
              disabled={resolvedItems.length === 0}
              className={`flex-1 flex items-center justify-center gap-2 font-black px-6 py-3.5 rounded-2xl text-sm transition-all shadow-xl select-none cursor-pointer transform active:scale-97 border border-purple-300/20 ${
                !isOnline
                  ? "bg-white/5 text-gray-500 border-white/5 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-400 hover:to-indigo-400 text-white shadow-purple-500/25"
              }`}
            >
              <span>{t.cartCheckout}</span>
            </button>
          </div>
          
          {!isOnline && (
            <div className="flex items-center gap-1.5 text-amber-400 text-2xs justify-center bg-amber-400/10 py-1.5 px-3 rounded-xl border border-amber-400/20 font-bold">
              <AlertTriangle size={12} />
              <span>{t.offlineWarning}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
