import React, { useState, useMemo } from "react";
import { TRANSLATIONS, formatPrice, formatDateTime } from "../utils/localizer";
import { Copy, Printer, Calendar, FileText, CheckCircle, Clock, Trash, Package, ShoppingBag, RotateCcw, Truck, XCircle } from "lucide-react";

export default function OrdersView({
  lang,
  currency,
  orders = [],
  user = null,
  onNotify,
  onDeleteOrder,
  onReorder
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS["en"];
  const isUr = lang === "ur";

  // Filter orders to ensure user privacy: non-admin users only see their own orders
  const displayOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    if (!user) return [];
    if (user.role === "admin") return orders;
    return orders.filter(o => 
      String(o.userId) === String(user.id) || 
      (user.email && o.userEmail && String(o.userEmail).toLowerCase() === String(user.email).toLowerCase())
    );
  }, [orders, user]);

  const normalizeStatus = (status) => {
    if (!status) return "Pending";
    const s = String(status).trim().toLowerCase();
    if (s === "delivered" || s === "fulfilled" || s === "completed") {
      return "Delivered";
    }
    if (s === "shipped") {
      return "Shipped";
    }
    if (s === "processing") {
      return "Processing";
    }
    if (s === "cancelled" || s === "canceled") {
      return "Cancelled";
    }
    return "Pending";
  };



  const getStatusDisplayName = (status, isUrdu) => {
    const norm = normalizeStatus(status);
    if (norm === "Pending") return isUrdu ? "پینڈنگ" : "Pending";
    if (norm === "Processing") return isUrdu ? "پروسیسنگ" : "Processing";
    if (norm === "Shipped") return isUrdu ? "بھیج دیا گیا (Shipped)" : "Shipped";
    if (norm === "Delivered") return isUrdu ? "ڈیلیور شدہ" : "Delivered";
    if (norm === "Cancelled") return isUrdu ? "منسوخ شدہ" : "Cancelled";
    return norm;
  };

  const getStatusIcon = (status) => {
    const norm = normalizeStatus(status);
    if (norm === "Pending") return <Clock size={13} className="text-blue-400" />;
    if (norm === "Processing") return <Package size={13} className="text-purple-400" />;
    if (norm === "Shipped") return <Truck size={13} className="text-amber-400" />;
    if (norm === "Delivered") return <ShoppingBag size={13} className="text-emerald-400" />;
    if (norm === "Cancelled") return <XCircle size={13} className="text-red-400" />;
    return <FileText size={13} className="text-purple-400" />;
  };

  const getTabStyles = (status, isActive) => {
    const norm = normalizeStatus(status);
    if (!isActive) return "text-gray-400 hover:text-white hover:bg-white/5";
    if (norm === "Pending") return "bg-blue-500/20 text-blue-200 border border-blue-500/40 shadow-sm";
    if (norm === "Processing") return "bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm";
    if (norm === "Shipped") return "bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm";
    if (norm === "Delivered") return "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 shadow-sm";
    if (norm === "Cancelled") return "bg-red-500/20 text-red-200 border border-red-500/40 shadow-sm";
    return "bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm";
  };

  const getBadgeStyles = (status) => {
    const norm = normalizeStatus(status);
    if (norm === "Pending") return "bg-blue-500/10 text-blue-300 border border-blue-500/20";
    if (norm === "Processing") return "bg-purple-500/10 text-purple-300 border border-purple-500/20";
    if (norm === "Shipped") return "bg-amber-500/10 text-amber-300 border border-amber-500/20";
    if (norm === "Delivered") return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20";
    if (norm === "Cancelled") return "bg-red-500/10 text-red-300 border border-red-500/20";
    return "bg-purple-500/10 text-purple-300 border border-purple-500/20";
  };

  const handlePrintReceipt = (order) => {
    const datetimeStr = formatDateTime(order.createdAt);
    let invoiceHtml = `
      <html>
      <head>
        <title>VoxCart Invoice - ${order.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 30px; color: #333; max-width: 600px; margin: 0 auto; background: #fafafa; }
          .receipt { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eee; }
          .header { text-align: center; margin-bottom: 24px; border-bottom: 2px dashed #ddd; padding-bottom: 20px; }
          .header h1 { font-size: 26px; margin: 0; color: #5a52d5; }
          .header p { margin: 4px 0 0; color: #777; font-size: 13px; }
          .meta { font-size: 13px; color: #555; display: flex; justify-content: space-between; margin-bottom: 16px; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { border-bottom: 2px solid #eee; padding: 10px 4px; text-align: left; font-size: 12px; color: #888; text-transform: uppercase; }
          td { padding: 12px 4px; border-bottom: 1px solid #f5f5f5; font-size: 14px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #555; }
          .grand-total { font-size: 20px; font-weight: bold; color: #000; border-top: 2px solid #5a52d5; padding-top: 12px; margin-top: 8px; }
          .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
          @media print { body { background: white; padding: 0; } .receipt { box-shadow: none; border: none; } }
          .item-visual { width: 24px; height: 24px; object-fit: cover; border-radius: 4px; display: inline-block; vertical-align: middle; margin-right: 6px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>🛒 VoxCart</h1>
            <p>Invoice Receipt · Order ${order.id}</p>
          </div>
          <div class="meta">
            <span>Date: ${datetimeStr}</span>
            <span>Currency: ${currency}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(item => {
                if (!item) return "";
                const priceVal = typeof item.price === "number" ? item.price : 0;
                const qtyVal = typeof item.qty === "number" ? item.qty : 1;
                const nameVal = item.name || "Unknown Product";
                const nameUrVal = item.nameUr || nameVal;
                const imgVal = item.img || "📦";
                const isUrl = typeof imgVal === "string" && (imgVal.startsWith("http") || imgVal.startsWith("/"));
                const visualTag = isUrl 
                  ? `<img src="${imgVal}" class="item-visual" />` 
                  : `<span>${imgVal}</span>`;
                return `
                  <tr>
                    <td>${visualTag} ${lang === 'ur' ? nameUrVal : nameVal}</td>
                    <td>${qtyVal} × ${formatPrice(priceVal, currency, lang, item.currencyCode || "USD")}</td>
                    <td style="text-align: right; font-weight: 600;">${formatPrice(priceVal * qtyVal, currency, lang, item.currencyCode || "USD")}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatPrice(order.subtotal, currency, lang, "USD")}</span>
          </div>
          <div class="total-row">
            <span>Tax (5%):</span>
            <span>${formatPrice(order.tax, currency, lang, "USD")}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total Paid:</span>
            <span>${formatPrice(order.total, currency, lang, "USD")}</span>
          </div>
          ${order.paymentMethod ? `
          <div class="total-row" style="font-size: 11px; color: #555555; border-top: 1px dotted #eeeeee; padding-top: 6px;">
            <span>Payment Method:</span>
            <span>${order.paymentMethod} (${order.paymentStatus || 'Pending'})</span>
          </div>
          ` : ''}
          <div class="footer">
            <p>Thank you for shopping on VoxCart!</p>
            <p style="font-size: 12px; font-weight: bold; margin-top: 4px; color: #5a52d5;">Managed By Team MLT</p>
            <p style="font-size: 11px; margin-top: 4px;">Fulfillment: ${order.status}</p>
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

  const copyOrderId = (orderId) => {
    navigator.clipboard.writeText(orderId);
    onNotify(isUr ? "آرڈر نمبر کاپی ہو گیا!" : "Order Reference copied to clipboard!", "success");
  };

  const handleReorderClick = (order) => {
    if (!order.items || order.items.length === 0) return;
    if (onReorder) {
      const itemsToAdd = order.items.map(item => ({
        id: item.productId || item.id,
        qty: item.qty || 1
      }));
      onReorder(itemsToAdd);
      onNotify(isUr ? "آرڈر کی تمام اشیاء دوبارہ کارٹ میں شامل کر دی گئیں!" : "Readded all items from this purchase to your cart!", "success");
    }
  };

  return (
    <div className="py-4 flex flex-col gap-6">
      {/* Header section */}
      <div className="border-b border-white/10 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white mb-1 flex items-center gap-2">
            <FileText className="text-purple-400" />
            <span>{isUr ? "آپ کے آرڈرز اور خریداری کی ہسٹری" : "Orders & Purchase History"}</span>
          </h2>
          <p className="text-sm text-white/50 leading-relaxed">
            {isUr 
              ? "اپنے تمام جاری اور مکمل شدہ آرڈرز، بشمول بھیجے گئے (Shipped) اور موصول شدہ (Delivered) خریدیں دیکھیں۔"
              : "Track active orders in real-time, view invoices, and inspect completed purchase history."}
          </p>
        </div>
      </div>

      {displayOrders.length === 0 ? (
        <div className="glass-panel border border-white/10 rounded-3xl p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2 shadow-xl">
          <FileText size={44} className="text-purple-400/20 mb-2 animate-bounce" />
          <h4 className="font-bold text-white text-lg">{t.noOrders}</h4>
          <p className="text-xs text-gray-400">{isUr ? "نئے آرڈر کی ادائیگی کے بعد رسیدیں یہاں ظاہر ہوں گی۔" : "All successfully fulfilled transactions print instantly below."}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {displayOrders.map((order) => {
            const dateStr = formatDateTime(order.createdAt);
            const normStat = normalizeStatus(order.status);
            const shippedOrDelivered = normStat === "Shipped" || normStat === "Delivered";

            return (
              <div
                key={order.id}
                className={`glass-panel border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition duration-300 shadow-xl hover:shadow-2xl ${
                  normStat === "Delivered"
                    ? "border-emerald-500/25 bg-emerald-950/10 hover:border-emerald-400/50"
                    : normStat === "Shipped"
                    ? "border-amber-500/25 bg-amber-950/10 hover:border-amber-400/50"
                    : "border-blue-500/25 bg-blue-950/10 hover:border-blue-400/50"
                }`}
              >
                {/* Left meta information */}
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-purple-300 bg-purple-500/15 px-3 py-1 rounded-xl border border-purple-500/20 text-xs flex items-center gap-1.5 shadow-sm">
                      <span>{order.id}</span>
                      <button 
                        onClick={() => copyOrderId(order.id)}
                        className="text-gray-400 hover:text-white transition p-0.5 cursor-pointer active:scale-90" 
                        title="Copy Reference"
                      >
                        <Copy size={11} />
                      </button>
                    </span>

                    <span className="flex items-center gap-1.5 text-gray-300 text-xs bg-slate-900 border border-white/10 px-3 py-1 rounded-xl font-medium">
                      <Calendar size={12} className="text-purple-400" />
                      <span>{dateStr}</span>
                    </span>

                    {/* Status Pill */}
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border flex items-center gap-1 ${
                      normStat === "Delivered"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : normStat === "Shipped"
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : normStat === "Processing"
                        ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                        : "bg-blue-500/15 text-blue-300 border-blue-500/30 animate-pulse"
                    }`}>
                      {normStat === "Delivered" ? (
                        <CheckCircle size={11} />
                      ) : normStat === "Shipped" ? (
                        <Truck size={11} />
                      ) : normStat === "Processing" ? (
                        <Package size={11} />
                      ) : (
                        <Clock size={11} />
                      )}
                      <span>{getStatusDisplayName(order.status, isUr)}</span>
                    </span>

                    {/* Purchase History Badge Tag */}
                    {normStat === "Delivered" && (
                      <span className="flex items-center gap-1 text-[10px] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl font-black uppercase tracking-wider shadow-sm">
                        <ShoppingBag size={11} className="text-emerald-400" />
                        <span>{isUr ? "خریداری کی ہسٹری" : "Purchase History"}</span>
                      </span>
                    )}

                    {order.paymentMethod && (
                      <span className="flex items-center gap-1 text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 px-3 py-1 rounded-xl font-black">
                        <span>💳</span>
                        <span>{order.paymentMethod}</span>
                        {order.paymentStatus === "Paid" ? (
                          <span className="text-[8px] text-emerald-300 ml-1 bg-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">Paid</span>
                        ) : (
                          <span className="text-[8px] text-amber-300 ml-1 bg-amber-500/20 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">Pending</span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Fulfill item lists horizontal */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(order.items || []).map((item, id) => {
                      if (!item) return null;
                      const nameVal = item.name || "Unknown Product";
                      const nameUrVal = item.nameUr || nameVal;
                      const qtyVal = typeof item.qty === "number" ? item.qty : 1;
                      const imgVal = item.img || "📦";
                      const isImgUrl = typeof imgVal === "string" && (imgVal.startsWith("http://") || imgVal.startsWith("https://") || imgVal.startsWith("/"));
                      return (
                        <span
                          key={id}
                          className="text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10 text-white flex items-center gap-2 font-medium shadow-sm hover:border-purple-400/30 transition-colors"
                        >
                          <div className="w-5 h-5 rounded overflow-hidden bg-slate-800 flex items-center justify-center shrink-0">
                            {isImgUrl ? (
                              <img src={imgVal} alt={nameVal} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span>{imgVal}</span>
                            )}
                          </div>
                          <span>{isUr ? nameUrVal : nameVal}</span>
                          <span className="text-purple-300 font-black shrink-0 bg-purple-500/20 px-1.5 py-0.5 rounded text-[10px]">×{qtyVal}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Right print, reorder and totals */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-white/10 pt-4 md:pt-0 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-gray-400 block mb-0.5 uppercase tracking-wider font-extrabold">{t.cartTotal}</span>
                    <span className="font-extrabold text-xl text-purple-300 font-display">
                      {formatPrice(order.total, currency, lang, "USD")}
                    </span>
                  </div>

                  {/* Reorder button removed as per request */}

                  <button
                    onClick={() => handlePrintReceipt(order)}
                    className="bg-white/5 hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-500 hover:text-white text-gray-200 font-bold p-3.5 rounded-2xl border border-white/10 transition shadow-sm flex items-center justify-center cursor-pointer active:scale-95"
                    title={t.viewReceipt}
                  >
                    <Printer size={18} />
                  </button>

                  {onDeleteOrder && !shippedOrDelivered && (
                    <button
                      onClick={async () => {
                        if (window.confirm(isUr ? "کیا آپ واقعی یہ آرڈر منسوخ کرنا چاہتے ہیں؟" : "Are you sure you want to cancel this order?")) {
                          await onDeleteOrder(order.id);
                        }
                      }}
                      className="bg-red-500/90 hover:bg-red-600 text-white font-bold text-xs px-4 py-3.5 rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md border border-red-400/30"
                      title={isUr ? "آرڈر منسوخ کریں" : "Cancel Order"}
                    >
                      <Trash size={14} />
                      <span>{isUr ? "آرڈر منسوخ کریں" : "Cancel Order"}</span>
                    </button>
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

