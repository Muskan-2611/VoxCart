const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `  const handleDeleteOrder = async (orderId) => {
    try {
      await api.deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      showToast(lang === "ur" ? "آرڈر کامیابی سے حذف کر دیا گیا!" : "Order deleted successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to delete order", "error");
    }
  };`;

const replacement = `  const handleDeleteOrder = async (orderId) => {
    try {
      await api.updateOrderStatus(orderId, "Cancelled");
      setOrders(prev => {
        const updated = prev.map(o => o.id === orderId ? { ...o, status: "Cancelled" } : o);
        localStorage.setItem("voxcart_orders_cache", JSON.stringify(updated));
        return updated;
      });
      showToast(lang === "ur" ? "آرڈر کامیابی سے منسوخ کر دیا گیا!" : "Order cancelled successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to cancel order", "error");
    }
  };`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/App.jsx', code);
    console.log("Fixed Cancel logic!");
} else {
    console.log("Could not find target block in App.jsx");
}
