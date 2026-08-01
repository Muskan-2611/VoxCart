const fs = require("fs");
const path = require("path");

const widgetPath = path.join(__dirname, "src", "components", "AIChatbotWidget.jsx");
let code = fs.readFileSync(widgetPath, "utf8");

// Update signature of generateDynamicClientResponse to include cartItems, orders, favourites
code = code.replace(
  'function generateDynamicClientResponse(query, lang, products = [], currency = "USD") {',
  'function generateDynamicClientResponse(query, lang, products = [], currency = "USD", cartItems = [], orders = [], favourites = []) {'
);

// Add live orders and live cart handlers inside generateDynamicClientResponse
const orderQueryTarget = `if (q.includes("order") || q.includes("track") || q.includes("status") || q.includes("invoice") || q.includes("history") || q.includes("آرڈر") || q.includes("رسید")) {`;

const orderQueryReplacement = `if ((q.includes("my order") || q.includes("order status") || q.includes("track my order") || q.includes("where is my order") || q.includes("میرے آرڈر") || q.includes("اسٹیٹس")) && Array.isArray(orders) && orders.length > 0) {
    const list = orders.map(o => \`- Order #\${o.id || o.orderId} | Total: \${o.total} \${o.currency || currency} | Status: **\${o.status || 'Pending'}**\`).join("\\n");
    return isUr
      ? \`📦 **آپ کے جاری اور حالیہ آرڈرز:**\\n\${list}\\n\\nتفصیلی رسید اور ٹریکنگ کے لیے **Orders** ٹیب پر دیکھیں۔\`
      : \`📦 **Your Active Orders & Tracking Status:**\\n\${list}\\n\\nNavigate to the **Orders** tab to download official PDF invoices or track delivery status in real-time!\`;
  }

  if (q.includes("order") || q.includes("track") || q.includes("status") || q.includes("invoice") || q.includes("history") || q.includes("آرڈر") || q.includes("رسید")) {`;

code = code.replace(orderQueryTarget, orderQueryReplacement);

// Add cart query handler
const cartQueryTarget = `if ((q.includes("add") && (q.includes("cart") || q.includes("basket"))) || q.includes("how to buy") || q.includes("ارٹ") || q.includes("خرید")) {`;

const cartQueryReplacement = `if ((q.includes("my cart") || q.includes("in my cart") || q.includes("cart items") || q.includes("میرے کارٹ") || q.includes("کارٹ میں کیا")) && Array.isArray(cartItems) && cartItems.length > 0) {
    const itemsList = cartItems.map(c => \`- \${c.name || 'Product'} (Qty: \${c.qty || 1})\`).join("\\n");
    return isUr
      ? \`🛒 **آپ کا شاپنگ کارٹ:**\\n\${itemsList}\\n\\nچیک آؤٹ کے لیے ہیڈر میں کارٹ آئیکن پر کلک کریں!\`
      : \`🛒 **Items Currently in Your Cart:**\\n\${itemsList}\\n\\nClick the cart icon at top right to proceed to checkout!\`;
  }

  if ((q.includes("add") && (q.includes("cart") || q.includes("basket"))) || q.includes("how to buy") || q.includes("ارٹ") || q.includes("خرید")) {`;

code = code.replace(cartQueryTarget, cartQueryReplacement);

// Update component props signature
code = code.replace(
  'export default function AIChatbotWidget({ lang, currency, activeTab, user, onNavigate, products, onCategoryExtracted, onAddItems, onNotify }) {',
  'export default function AIChatbotWidget({ lang, currency, activeTab, user, onNavigate, products, cartItems = [], orders = [], favourites = [], onCategoryExtracted, onAddItems, onNotify }) {'
);

// Update calls to generateDynamicClientResponse inside component
code = code.replace(
  'generateDynamicClientResponse(userMessageText, lang, products, currency)',
  'generateDynamicClientResponse(userMessageText, lang, products, currency, cartItems, orders, favourites)'
);

fs.writeFileSync(widgetPath, code, "utf8");
console.log("Successfully patched AIChatbotWidget.jsx with live user orders & cart context!");
