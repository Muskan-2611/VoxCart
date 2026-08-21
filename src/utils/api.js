// API Client Utility supporting both local Node backend (for Studio preview)
// and deployed PHP+MySQL backend. Automatically converts structures.

// Set BACKEND_TYPE to "node" (default for sandbox preview) or "php" (for local XAMPP/PHP+MySQL hosting on your PC).
// Changing this to "php" redirects all frontend API requests to your local PHP server (PHP_BASE_URL).
const BACKEND_TYPE = "php"; 
const NODE_BASE_URL = "/api";
const PHP_BASE_URL = "http://localhost/voxcart-api/api.php";

async function request(endpoint, options = {}) {
  let url = "";
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.substring(1) : endpoint;

  if (BACKEND_TYPE === "node") {
    url = `${NODE_BASE_URL}/${cleanEndpoint}`;
  } else {
    // For PHP, we map REST endpoints to API query parameters
    const [path, query] = cleanEndpoint.split("?");
    const queryParams = query ? `&${query}` : "";
    if (path.startsWith("auth/login")) {
      url = `${PHP_BASE_URL}?action=login`;
    } else if (path.startsWith("auth/register")) {
      url = `${PHP_BASE_URL}?action=register`;
    } else if (path.startsWith("auth/reset-password")) {
      url = `${PHP_BASE_URL}?action=reset_password`;
    } else if (path.startsWith("auth/update-password")) {
      url = `${PHP_BASE_URL}?action=update_password`;
    } else if (path.startsWith("auth/update-avatar")) {
      url = `${PHP_BASE_URL}?action=update_avatar`;
    } else if (path.startsWith("auth/send-verification-code")) {
      url = `${PHP_BASE_URL}?action=send_verification_code`;
    } else if (path.startsWith("auth/verify-code")) {
      url = `${PHP_BASE_URL}?action=verify_code`;
    } else if (path.startsWith("feedback")) {
      const parts = path.split("/");
      if (parts[2] === "reply") {
        url = `${PHP_BASE_URL}?action=reply_feedback&id=${parts[1]}`;
      } else if (options.method === "DELETE") {
        url = `${PHP_BASE_URL}?action=delete_feedback&id=${parts[1]}`;
      } else if (options.method === "POST") {
        url = `${PHP_BASE_URL}?action=submit_feedback`;
      } else {
        url = `${PHP_BASE_URL}?action=get_feedback${queryParams}`;
      }
    } else if (path.startsWith("products")) {
      if (options.method === "POST") {
        url = `${PHP_BASE_URL}?action=create_product`;
      } else if (options.method === "PUT") {
        const id = path.split("/")[1];
        url = `${PHP_BASE_URL}?action=edit_product&id=${id}`;
      } else if (options.method === "DELETE") {
        const id = path.split("/")[1];
        url = `${PHP_BASE_URL}?action=delete_product&id=${id}`;
      } else {
        url = `${PHP_BASE_URL}?action=get_products`;
      }
    } else if (path.startsWith("cart")) {
      const parts = path.split("/");
      const userId = parts[1];
      if (parts[2] === "sync") {
        url = `${PHP_BASE_URL}?action=sync_cart&userId=${userId}`;
      } else if (options.method === "DELETE") {
        url = `${PHP_BASE_URL}?action=clear_cart&userId=${userId}`;
      } else if (options.method === "POST") {
        url = `${PHP_BASE_URL}?action=set_cart_qty&userId=${userId}`;
      } else {
        url = `${PHP_BASE_URL}?action=get_cart&userId=${userId}`;
      }
    } else if (path.startsWith("favourites")) {
      const userId = path.split("/")[1];
      if (options.method === "POST") {
        url = `${PHP_BASE_URL}?action=toggle_favourite&userId=${userId}`;
      } else {
        url = `${PHP_BASE_URL}?action=get_favourites&userId=${userId}`;
      }
    } else if (path.startsWith("orders")) {
      const parts = path.split("/");
      const p1 = parts[1];
      if (options.method === "POST") {
        url = `${PHP_BASE_URL}?action=create_order&userId=${p1}`;
      } else if (options.method === "PUT") {
        const orderId = parts[1];
        url = `${PHP_BASE_URL}?action=update_order_status&orderId=${orderId}`;
      } else if (options.method === "DELETE") {
        const orderId = parts[1];
        url = `${PHP_BASE_URL}?action=delete_order&orderId=${orderId}`;
      } else {
        url = `${PHP_BASE_URL}?action=get_orders&userId=${p1}`;
      }
    } else if (path.startsWith("admin/dashboard")) {
      url = `${PHP_BASE_URL}?action=admin_dashboard`;
    } else if (path.startsWith("admin/users")) {
      if (options.method === "POST") {
        url = `${PHP_BASE_URL}?action=create_admin_user`;
      } else if (options.method === "DELETE") {
        const id = path.split("/")[2];
        url = `${PHP_BASE_URL}?action=delete_admin_user&id=${id}`;
      } else {
        url = `${PHP_BASE_URL}?action=get_admin_users`;
      }
    } else if (path.startsWith("categories")) {
      if (options.method === "POST") {
        url = `${PHP_BASE_URL}?action=create_category`;
      } else if (options.method === "PUT") {
        const id = path.split("/")[1];
        url = `${PHP_BASE_URL}?action=edit_category&id=${id}`;
      } else if (options.method === "DELETE") {
        const id = path.split("/")[1];
        url = `${PHP_BASE_URL}?action=delete_category&id=${id}`;
      } else {
        url = `${PHP_BASE_URL}?action=get_categories`;
      }
    } else if (path.startsWith("brands")) {
      if (options.method === "POST") {
        url = `${PHP_BASE_URL}?action=create_brand`;
      } else if (options.method === "PUT") {
        const id = path.split("/")[1];
        url = `${PHP_BASE_URL}?action=edit_brand&id=${id}`;
      } else if (options.method === "DELETE") {
        const id = path.split("/")[1];
        url = `${PHP_BASE_URL}?action=delete_brand&id=${id}`;
      } else {
        url = `${PHP_BASE_URL}?action=get_brands`;
      }
    } else if (path.startsWith("subcategories")) {
      if (options.method === "POST") {
        url = `${PHP_BASE_URL}?action=create_subcategory`;
      } else if (options.method === "PUT") {
        const id = path.split("/")[1];
        url = `${PHP_BASE_URL}?action=edit_subcategory&id=${id}`;
      } else if (options.method === "DELETE") {
        const id = path.split("/")[1];
        url = `${PHP_BASE_URL}?action=delete_subcategory&id=${id}`;
      } else {
        url = `${PHP_BASE_URL}?action=get_subcategories`;
      }
    } else if (path.startsWith("units")) {
      if (options.method === "POST") {
        url = `${PHP_BASE_URL}?action=create_unit`;
      } else if (options.method === "PUT") {
        const id = path.split("/")[1];
        url = `${PHP_BASE_URL}?action=edit_unit&id=${id}`;
      } else if (options.method === "DELETE") {
        const id = path.split("/")[1];
        url = `${PHP_BASE_URL}?action=delete_unit&id=${id}`;
      } else {
        url = `${PHP_BASE_URL}?action=get_units`;
      }
    } else if (path.startsWith("currencies")) {
      if (options.method === "POST") {
        url = `${PHP_BASE_URL}?action=create_currency`;
      } else if (options.method === "PUT") {
        const id = path.split("/")[1];
        url = `${PHP_BASE_URL}?action=edit_currency&id=${id}`;
      } else if (options.method === "DELETE") {
        const id = path.split("/")[1];
        url = `${PHP_BASE_URL}?action=delete_currency&id=${id}`;
      } else {
        url = `${PHP_BASE_URL}?action=get_currencies`;
      }
    } else if (path.startsWith("exchange-rates") || path.startsWith("exchange_rates")) {
      url = `${PHP_BASE_URL}?action=exchange_rates`;
    } else if (path.startsWith("ocr") || path.startsWith("process-ocr") || path.startsWith("process_ocr")) {
      url = `${PHP_BASE_URL}?action=ocr`;
    } else if (path.startsWith("upload-image") || path.startsWith("upload_image")) {
      url = `${PHP_BASE_URL}?action=upload_image`;
    } else if (path.startsWith("voice-parse") || path.startsWith("voice_parse")) {
      url = `${PHP_BASE_URL}?action=voice_parse`;
    } else if (path.startsWith("smart-search") || path.startsWith("smart_search")) {
      url = `${PHP_BASE_URL}?action=smart_search`;
    } else if (path.startsWith("recipe-search") || path.startsWith("recipe_search")) {
      url = `${PHP_BASE_URL}?action=recipe_search`;
    } else if (path.startsWith("chatbot")) {
      url = `${PHP_BASE_URL}?action=chatbot`;
    }
  }

  const defaultHeaders = {
    "Content-Type": "application/json"
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      const text = await response.text();
      if (text.includes("__cookie_check") || response.url.includes("__cookie_check")) {
        throw new Error("AI Studio Sandbox cookie authorization is required. Please click 'Open in new tab' at the top right of the preview to complete cookie authorization and refresh the page.");
      }
      throw new Error(`Expected JSON but received HTML. The route might not exist, or the server returned an error page. Status: ${response.status}`);
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `HTTP ${response.status} Error`);
    }

    return await response.json();
  } catch (err) {
    if (BACKEND_TYPE === "php") {
      // If local PHP server is unreachable, offline, or returns error, fall back to the live server
      try {
        const fallbackUrl = `${NODE_BASE_URL}/${cleanEndpoint}`;
        const fbResponse = await fetch(fallbackUrl, {
          ...options,
          headers: {
            ...defaultHeaders,
            ...options.headers
          }
        });
        if (fbResponse.ok) {
          const fbContentType = fbResponse.headers.get("content-type") || "";
          if (!fbContentType.includes("text/html")) {
            return await fbResponse.json();
          }
        }
      } catch (fallbackErr) {
        // Fallback error ignored
      }
    }
    console.warn(`API Request Info [${url}]:`, err.message || err);
    throw err;
  }
}

export const api = {
  // Authentication
  login: (email, password, verificationCode = null) => request("auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, verificationCode, code: verificationCode })
  }),
  
  register: (name, email, password, verificationCode = null) => request("auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, verificationCode, code: verificationCode })
  }),

  resetPassword: (email, newPassword) => request("auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, newPassword })
  }),

  updatePassword: (userId, currentPassword, newPassword) => request("auth/update-password", {
    method: "POST",
    body: JSON.stringify({ userId, currentPassword, newPassword })
  }),

  // Products
  getProducts: async () => {
    const data = await request("products");
    return Array.isArray(data) ? data.map(p => ({
      ...p,
      nameUr: p.nameUr || p.name_ur || p.name,
      unitUr: p.unitUr || p.unit_ur || p.unit || "عدد"
    })) : [];
  },
  
  createProduct: async (productData) => {
    const p = await request("products", {
      method: "POST",
      body: JSON.stringify(productData)
    });
    return {
      ...p,
      nameUr: p.nameUr || p.name_ur || p.name,
      unitUr: p.unitUr || p.unit_ur || p.unit || "عدد"
    };
  },
  
  editProduct: async (id, productData) => {
    const p = await request(`products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData)
    });
    return {
      ...p,
      nameUr: p.nameUr || p.name_ur || p.name,
      unitUr: p.unitUr || p.unit_ur || p.unit || "عدد"
    };
  },
  
  deleteProduct: (id) => request(`products/${id}`, {
    method: "DELETE"
  }),

  // Cart (synchronized with server)
  getCart: async (userId) => {
    try {
      const data = await request(`cart/${userId}`);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn(`Failed to fetch cart for ${userId}:`, e);
      return [];
    }
  },
  
  setCartQty: (userId, productId, qty, itemData = {}) => request(`cart/${userId}`, {
    method: "POST",
    body: JSON.stringify({ productId, qty, ...itemData })
  }),
  
  syncCart: (userId, items) => request(`cart/${userId}/sync`, {
    method: "POST",
    body: JSON.stringify({ items })
  }),
  
  clearCart: (userId) => request(`cart/${userId}`, {
    method: "DELETE"
  }),

  // Favourites
  getFavourites: async (userId) => {
    try {
      const data = await request(`favourites/${userId}`);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn(`Failed to fetch favourites for ${userId}:`, e);
      return [];
    }
  },
  
  toggleFavourite: (userId, productId) => request(`favourites/${userId}`, {
    method: "POST",
    body: JSON.stringify({ productId })
  }),

  // Orders
  getOrders: async (userId) => {
    try {
      const data = await request(`orders/${userId}`);
      return Array.isArray(data) ? data.map(ro => {
        let parsedItems = [];
        if (ro.items) {
          if (typeof ro.items === "string") {
            try {
              parsedItems = JSON.parse(ro.items);
            } catch (e) {
              parsedItems = [];
            }
          } else if (Array.isArray(ro.items)) {
            parsedItems = ro.items;
          }
        }
        return {
          ...ro,
          items: parsedItems,
          userId: ro.userId || ro.user_id,
          createdAt: ro.createdAt || ro.created_at
        };
      }) : [];
    } catch (e) {
      console.warn(`Failed to fetch orders for ${userId}:`, e);
      return [];
    }
  },
  
  createOrder: (userId, orderData) => request(`orders/${userId}`, {
    method: "POST",
    body: JSON.stringify(orderData)
  }),
  
  updateOrderStatus: (orderId, status) => request(`orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  }),

  deleteOrder: (orderId) => request(`orders/${orderId}`, {
    method: "DELETE"
  }),

  // Admin insights
  getAdminDashboard: async () => {
    const data = await request("admin/dashboard");
    if (data && Array.isArray(data.recentOrders)) {
      data.recentOrders = data.recentOrders.map(ro => {
        let parsedItems = [];
        if (ro.items) {
          if (typeof ro.items === "string") {
            try {
              parsedItems = JSON.parse(ro.items);
            } catch (e) {
              parsedItems = [];
            }
          } else if (Array.isArray(ro.items)) {
            parsedItems = ro.items;
          }
        }
        return {
          ...ro,
          items: parsedItems,
          userId: ro.userId || ro.user_id,
          createdAt: ro.createdAt || ro.created_at
        };
      });
    }
    return data;
  },

  getAdminUsers: () => request("admin/users"),

  createAdminUser: (userData) => request("admin/users", {
    method: "POST",
    body: JSON.stringify(userData)
  }),

  deleteAdminUser: (id) => request(`admin/users/${id}`, {
    method: "DELETE"
  }),

  // Categories
  getCategories: () => request("categories"),
  
  createCategory: (catData) => request("categories", {
    method: "POST",
    body: JSON.stringify(catData)
  }),
  
  updateCategory: (id, catData) => request(`categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(catData)
  }),
  
  deleteCategory: (id) => request(`categories/${id}`, {
    method: "DELETE"
  }),

  // Brands CRUD
  getBrands: () => request("brands"),
  createBrand: (brandData) => request("brands", {
    method: "POST",
    body: JSON.stringify(brandData)
  }),
  updateBrand: (id, brandData) => request(`brands/${id}`, {
    method: "PUT",
    body: JSON.stringify(brandData)
  }),
  deleteBrand: (id) => request(`brands/${id}`, {
    method: "DELETE"
  }),

  // Subcategories CRUD
  getSubcategories: () => request("subcategories"),
  createSubcategory: (subData) => request("subcategories", {
    method: "POST",
    body: JSON.stringify(subData)
  }),
  updateSubcategory: (id, subData) => request(`subcategories/${id}`, {
    method: "PUT",
    body: JSON.stringify(subData)
  }),
  deleteSubcategory: (id) => request(`subcategories/${id}`, {
    method: "DELETE"
  }),

  // Units CRUD
  getUnits: () => request("units"),
  createUnit: (unitData) => request("units", {
    method: "POST",
    body: JSON.stringify(unitData)
  }),
  updateUnit: (id, unitData) => request(`units/${id}`, {
    method: "PUT",
    body: JSON.stringify(unitData)
  }),
  deleteUnit: (id) => request(`units/${id}`, {
    method: "DELETE"
  }),

  // Currencies CRUD
  getCurrencies: () => request("currencies"),
  createCurrency: (currencyData) => request("currencies", {
    method: "POST",
    body: JSON.stringify(currencyData)
  }),
  updateCurrency: (id, currencyData) => request(`currencies/${id}`, {
    method: "PUT",
    body: JSON.stringify(currencyData)
  }),
  deleteCurrency: (id) => request(`currencies/${id}`, {
    method: "DELETE"
  }),

  // Exchange Rates
  getExchangeRates: () => request("exchange-rates"),

  // Multimodal Gemini OCR
  processOcr: (imageBase64, mimeType) => {
    const payload = typeof imageBase64 === "object" ? imageBase64 : { imageBase64, mimeType };
    return request("ocr", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  // Gemini Spoken Voice List Parser
  parseVoice: (text) => {
    return request("voice-parse", {
      method: "POST",
      body: JSON.stringify({ text })
    });
  },

  // Universal Smart Search System
  smartSearch: (query, lang) => {
    return request("smart-search", {
      method: "POST",
      body: JSON.stringify({ query, lang })
    });
  },

  // Local secure server image upload
  uploadImage: (imageBase64) => {
    return request("upload-image", {
      method: "POST",
      body: JSON.stringify({ file: imageBase64 })
    });
  },

  // User-Specific Extracted Categories (Logged-In User Only)
  getUserCategories: async (userId) => {
    if (!userId || userId === "guest") return [];
    try {
      const data = await request(`user-categories/${userId}`);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn(`Failed to fetch user categories for ${userId}:`, e);
      return [];
    }
  },
  addUserCategory: (userId, catData) => request(`user-categories/${userId}`, {
    method: "POST",
    body: JSON.stringify(catData)
  }),
  deleteUserCategory: (userId, categoryId) => request(`user-categories/${userId}/${categoryId}`, {
    method: "DELETE"
  }),
  extractCategories: (message, userId, language = "en") => request("user-categories/extract", {
    method: "POST",
    body: JSON.stringify({ message, userId, language })
  }),

  // AI Recipe Search & Ingredient Extractor
  searchRecipe: (query, lang = "en", currency = "USD") => {
    return request("recipe-search", {
      method: "POST",
      body: JSON.stringify({ query, lang, currency })
    });
  },
  // AI Chatbot Trained Guide
  sendChatMessage: (message, chatHistory = [], language = "en", currency = "USD", activeTab = "home", userId = null) => {
    return request("chatbot", {
      method: "POST",
      body: JSON.stringify({ message, chatHistory, language, currency, activeTab, userId })
    });
  },

  // Email Verification System
  sendVerificationCode: (email) => request("auth/send-verification-code", {
    method: "POST",
    body: JSON.stringify({ email })
  }),
  verifyCode: (email, code) => request("auth/verify-code", {
    method: "POST",
    body: JSON.stringify({ email, code })
  }),

  // Feedback & Complaint System
  submitFeedback: (feedbackData) => request("feedback", {
    method: "POST",
    body: JSON.stringify(feedbackData)
  }),
  getFeedback: (userId = null, email = null) => {
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    if (email) params.append("email", email);
    const queryString = params.toString();
    return request(`feedback${queryString ? "?" + queryString : ""}`);
  },
  replyFeedback: (id, adminResponse) => request(`feedback/${id}/reply`, {
    method: "POST",
    body: JSON.stringify({ adminResponse })
  }),
  deleteFeedback: (id) => request(`feedback/${id}`, {
    method: "DELETE"
  })
};
