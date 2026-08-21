import React, { useState, useEffect, useMemo } from "react";
import { TRANSLATIONS, formatPrice } from "../utils/localizer";
import { api } from "../utils/api";
import { validateStrongPassword } from "../utils/passwordValidator";
import RichTextEditor from "./RichTextEditor";
import { 
  Trash, 
  Edit3, 
  Check, 
  DollarSign, 
  Users, 
  Package, 
  ShoppingCart, 
  Plus, 
  Eye, 
  EyeOff, 
  Shield, 
  UserPlus, 
  CheckCircle2, 
  FileSpreadsheet, 
  ArrowLeftRight,
  UploadCloud,
  FileText,
  Layers,
  Settings,
  Download,
  Upload,
  AlertCircle,
  Loader2,
  ImageIcon,
  FolderPlus,
  RefreshCw,
  MessageSquare,
  Send,
  Star,
  Clock,
  ShieldAlert,
  MessageCircle,
  X
} from "lucide-react";
import MasterSettings from "./MasterSettings";

export default function AdminPanel({
  lang,
  currency,
  logs = [],
  products = [],
  onRefreshProducts,
  onRefreshOrders,
  onNotify
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS["en"];
  const isUr = lang === "ur";
  
  // Tab state: "overview" | "products" | "categories" | "users"
  const [activeSubTab, setActiveSubTab] = useState("overview");
  
  // Dashboard Metrics
  const [stats, setStats] = useState({
    totalSalesUsd: 0,
    orderCount: 0,
    productCount: 0,
    userCount: 0,
    recentOrders: [],
    salesByCategory: {}
  });

  // User list state
  const [userList, setUserList] = useState([]);

  // Feedback & Complaint state
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const [replyingItem, setReplyingItem] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  
  // Password Visibility Maps
  const [showPasswordMap, setShowPasswordMap] = useState({});
  const [showAdminUserFormPass, setShowAdminUserFormPass] = useState(false);

  // --- Category Management System
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ id: "", name: "", nameUr: "" });
  const [editingCategory, setEditingCategory] = useState(null);

  // --- Brand, Subcategory, Unit, Currency Lists and Forms
  const [brandsList, setBrandsList] = useState([]);
  const [brandForm, setBrandForm] = useState({ name: "", logo: "", status: "Active" });
  const [editingBrand, setEditingBrand] = useState(null);

  const [subcategoriesList, setSubcategoriesList] = useState([]);
  const [subcategoryForm, setSubcategoryForm] = useState({ name: "", nameUr: "", categoryId: "", status: "Active" });
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  const [unitsList, setUnitsList] = useState([]);
  const [unitForm, setUnitForm] = useState({ name: "", nameUr: "", status: "Active" });
  const [editingUnit, setEditingUnit] = useState(null);

  const [currenciesList, setCurrenciesList] = useState([]);
  const [currencyForm, setCurrencyForm] = useState({ name: "", code: "", symbol: "", status: "Active" });
  const [editingCurrency, setEditingCurrency] = useState(null);

  // --- Product fields state (with Multi-Image support)
  const [editingProdId, setEditingProdId] = useState(null);
  const [prodPage, setProdPage] = useState(1);
  const [prodPageSize, setProdPageSize] = useState(10);
  const [prodForm, setProdForm] = useState({
    name: "",
    nameUr: "",
    brandId: "brand-general",
    categoryId: "Pantry",
    subcategoryId: "sub-rice",
    unitId: "unit-piece",
    currencyId: "curr-pkr",
    price: "",
    salePrice: "",
    img: "",
    unit: "Piece",
    unitUr: "عدد",
    images: [], // Additional gallery photo objects: { url, publicId }
    sku: "",
    batchNumber: "",
    manufacturingDate: "",
    expiryDate: "",
    stockQuantity: "100",
    description: "",
    status: "Active"
  });

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });

  // --- Local Secure Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingUrl, setUploadingUrl] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // --- Search / Filter states
  const [prodFilterQuery, setProdFilterQuery] = useState("");
  const [prodFilterCategory, setProdFilterCategory] = useState("all");

  const staticSampleImages = [
    { title: "Milk", url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80" },
    { title: "Eggs", url: "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?auto=format&fit=crop&w=300&q=80" },
    { title: "Cheese", url: "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?auto=format&fit=crop&w=300&q=80" },
    { title: "Butter", url: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=300&q=80" },
    { title: "Banana", url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=300&q=80" },
    { title: "Apple", url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&q=80" },
    { title: "Orange", url: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=300&q=80" },
    { title: "Mango", url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=300&q=80" },
    { title: "Tomato", url: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=300&q=80" },
    { title: "Potato", url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80" },
    { title: "Onion", url: "https://images.unsplash.com/photo-1508747703725-719777137510?auto=format&fit=crop&w=300&q=80" },
    { title: "Carrot", url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&q=80" },
    { title: "Chicken", url: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=300&q=80" },
    { title: "Steak / Beef", url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=300&q=80" },
    { title: "Salmon", url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=300&q=80" },
    { title: "Mineral Water", url: "https://images.unsplash.com/photo-1608885898957-a599fb1c1404?auto=format&fit=crop&w=300&q=80" },
    { title: "Soda Can", url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80" },
    { title: "Green Tea", url: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=300&q=80" },
    { title: "Rice Packet", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80" },
    { title: "Pasta Box", url: "https://images.unsplash.com/photo-1612966608967-30914a7c646a?auto=format&fit=crop&w=300&q=80" },
    { title: "Cooking Oil", url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80" }
  ];

  // Dynamic preset image selection list: appends any distinct images used in manual products instantly
  const dynamicPresetImages = useMemo(() => {
    const list = [...staticSampleImages];
    if (products) {
      products.forEach(p => {
        if (p.img && typeof p.img === "string" && p.img.startsWith("http")) {
          if (!list.some(s => s.url === p.img)) {
            list.push({ title: p.name, url: p.img });
          }
        }
      });
    }
    return list;
  }, [products]);

  // --- AUTOMATIC FORM AUTO-SAVE PRESERVATION HOOKS
  useEffect(() => {
    const savedProd = localStorage.getItem("voxcart_draft_prodForm");
    if (savedProd) {
      try {
        const parsed = JSON.parse(savedProd);
        setProdForm(parsed);
      } catch (e) {}
    }

    const savedUser = localStorage.getItem("voxcart_draft_newUserForm");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setNewUserForm(parsed);
      } catch (e) {}
    }
  }, []);

  // Save drafts to localStorage on state modifications
  useEffect(() => {
    localStorage.setItem("voxcart_draft_prodForm", JSON.stringify(prodForm));
  }, [prodForm]);

  useEffect(() => {
    localStorage.setItem("voxcart_draft_newUserForm", JSON.stringify(newUserForm));
  }, [newUserForm]);

  // Load metrics, users, feedback, and all relational database tables on mount or product updates
  useEffect(() => {
    fetchDashStats();
    fetchUsersDirectory();
    fetchFeedbackItems();
    fetchAllRelationalData();
  }, [products]);

  const fetchFeedbackItems = async () => {
    try {
      const items = await api.getFeedback();
      setFeedbackList(Array.isArray(items) ? items : []);
    } catch (e) {
      console.warn("Could not retrieve feedback items", e);
    }
  };

  const handleAdminReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyingItem || !replyText.trim()) return;
    setSendingReply(true);
    try {
      await api.replyFeedback(replyingItem.id, replyText.trim());
      onNotify("Response sent to user successfully!", "success");
      setReplyingItem(null);
      setReplyText("");
      fetchFeedbackItems();
    } catch (err) {
      onNotify(err.message || "Failed to submit reply", "error");
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteFeedbackItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback entry?")) return;
    try {
      await api.deleteFeedback(id);
      onNotify("Feedback entry deleted.", "success");
      fetchFeedbackItems();
    } catch (err) {
      onNotify(err.message || "Failed to delete feedback entry", "error");
    }
  };

  const fetchDashStats = async () => {
    try {
      const data = await api.getAdminDashboard();
      if (data) {
        setStats(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (e) {
      console.warn("Could not retrieve admin dashboard metrics", e);
    }
  };

  const fetchUsersDirectory = async () => {
    try {
      const usersData = await api.getAdminUsers();
      setUserList(usersData || []);
    } catch (e) {
      console.warn("Could not retrieve system users list", e);
    }
  };

  const fetchAllRelationalData = async () => {
    try {
      const [b, c, s, u, cur] = await Promise.all([
        api.getBrands().catch(() => []),
        api.getCategories().catch(() => []),
        api.getSubcategories().catch(() => []),
        api.getUnits().catch(() => []),
        api.getCurrencies().catch(() => [])
      ]);
      setBrandsList(b || []);
      setCategoriesList(c || []);
      setSubcategoriesList(s || []);
      setUnitsList(u || []);
      setCurrenciesList(cur || []);
    } catch (e) {
      console.error("Could not retrieve relational lookup tables from database:", e);
    }
  };

  // Dynamically load/filter subcategories based on the selected category
  const filteredSubcatsForProduct = useMemo(() => {
    return subcategoriesList.filter(s => s.categoryId?.toLowerCase() === prodForm.categoryId?.toLowerCase() && s.status === "Active");
  }, [subcategoriesList, prodForm.categoryId]);

  // Synchronize subcategoryId automatically when main category switches
  useEffect(() => {
    if (subcategoriesList.length === 0) return; // Wait until loaded
    if (filteredSubcatsForProduct.length > 0) {
      const isValid = filteredSubcatsForProduct.some(s => s.id.toLowerCase() === prodForm.subcategoryId?.toLowerCase());
      if (!isValid) {
        setProdForm(prev => {
          const hasVal = prev.subcategoryId && filteredSubcatsForProduct.some(s => s.id.toLowerCase() === prev.subcategoryId.toLowerCase());
          if (hasVal) return prev;
          return { ...prev, subcategoryId: filteredSubcatsForProduct[0].id };
        });
      }
    } else {
      setProdForm(prev => {
        if (prev.subcategoryId === "") return prev;
        return { ...prev, subcategoryId: "" };
      });
    }
  }, [prodForm.categoryId, filteredSubcatsForProduct, subcategoriesList.length]);

  // Synchronize product currency selection with global display currency selection
  useEffect(() => {
    if (!editingProdId && currenciesList.length > 0 && currency) {
      const matched = currenciesList.find(c => c.code.toUpperCase() === currency.toUpperCase());
      if (matched) {
        setProdForm(prev => {
          if (prev.currencyId === matched.id) return prev;
          return { ...prev, currencyId: matched.id };
        });
      }
    }
  }, [currency, currenciesList, editingProdId]);

  const selectedCurrencyObj = useMemo(() => {
    return currenciesList.find(c => c.id === prodForm.currencyId);
  }, [currenciesList, prodForm.currencyId]);

  const selectedCurrencyCode = selectedCurrencyObj ? selectedCurrencyObj.code : "PKR";

  const compressImage = (file, maxWidth, maxHeight, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% quality JPEG
        callback(dataUrl);
      };
      img.onerror = () => {
        callback(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Secure automatic local upload via Node backend API
  const handleLocalImageUpload = async (file, appendToGallery = false) => {
    // Validate image format
    if (!file.type.startsWith("image/")) {
      onNotify("Invalid file. Please select a valid JPEG, PNG, or WEBP image.", "error");
      return;
    }
    // Validate file size (under 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onNotify("Image size must be less than 5MB.", "error");
      return;
    }

    setUploadingImage(true);
    
    // Auto compress image on the client-side to prevent any 413 Payload Too Large errors
    compressImage(file, 1024, 1024, async (localBase64) => {
      try {
        const data = await api.uploadImage(localBase64);
        const imageUrl = data.url;
        const publicId = data.publicId;

        if (appendToGallery) {
          setProdForm(prev => ({
            ...prev,
            images: [...(prev.images || []), { url: imageUrl, publicId }]
          }));
          onNotify("Image added to product gallery successfully!", "success");
        } else {
          setProdForm(prev => ({
            ...prev,
            img: imageUrl
          }));
          onNotify("Primary image updated successfully!", "success");
        }
      } catch (err) {
        console.error("Local upload error:", err);
        // Fallback to direct local base64 on error
        const fallbackUrl = localBase64;
        const fallbackId = `local_base64_${Date.now()}`;
        if (appendToGallery) {
          setProdForm(prev => ({
            ...prev,
            images: [...(prev.images || []), { url: fallbackUrl, publicId: fallbackId }]
          }));
          onNotify("Image added to product gallery using local fallback storage!", "success");
        } else {
          setProdForm(prev => ({
            ...prev,
            img: fallbackUrl
          }));
          onNotify("Primary image updated using local fallback storage!", "success");
        }
      } finally {
        setUploadingImage(false);
      }
    });
  };

  // Drag and drop events for Product Form Upload Box
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleLocalImageUpload(file, false);
    }
  };

  const handleFileChange = async (e, isGallery = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleLocalImageUpload(file, isGallery);
    }
  };

  const removeGalleryImage = (idx) => {
    setProdForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
    onNotify("Gallery image reference deleted.", "info");
  };

  // Image Optimization tool: resizes Unsplash image dynamically
  const applyImageOptimization = () => {
    if (!prodForm.img) {
      onNotify("No primary image URL is set. Cannot optimize.", "warning");
      return;
    }
    if (prodForm.img.includes("unsplash.com")) {
      // replace or inject auto-format, fit-crop, optimized parameters
      let cleanUrl = prodForm.img.split("?")[0];
      cleanUrl += "?auto=format&fit=crop&w=500&q=80";
      setProdForm({ ...prodForm, img: cleanUrl });
      onNotify("Applied advanced mobile-first compression parameters to Unsplash image URL!", "success");
    } else {
      onNotify("Image parameters are already optimal.", "info");
    }
  };

  // Securely host pasted external HTTP/HTTPS link to local server automatically
  const uploadExternalUrlToLocalServer = async () => {
    if (!prodForm.img) {
      onNotify("Please enter a valid image URL first.", "warning");
      return;
    }
    if (!prodForm.img.startsWith("http://") && !prodForm.img.startsWith("https://")) {
      onNotify("Please paste a valid HTTP or HTTPS image link.", "warning");
      return;
    }

    setUploadingUrl(true);
    onNotify("Configuring remote image URL...", "info");
    try {
      const data = await api.uploadImage(prodForm.img);
      setProdForm(prev => ({
        ...prev,
        img: data.url
      }));
      onNotify("Image URL configured successfully!", "success");
    } catch (err) {
      console.error("URL configuration failed:", err);
      onNotify(`Could not process external link: ${err.message || "Please verify your link."}`, "error");
    } finally {
      setUploadingUrl(false);
    }
  };

  // Create Product or Update existing one
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.price) {
      onNotify("Please fill in required fields.", "error");
      return;
    }

    try {
      const unitObj = unitsList.find(u => u.id === prodForm.unitId);
      const categoryObj = categoriesList.find(c => c.id === prodForm.categoryId);
      const currencyObj = currenciesList.find(c => c.id === prodForm.currencyId);

      const payload = {
        ...prodForm,
        categoryId: prodForm.categoryId,
        category_id: prodForm.categoryId,
        subcategoryId: prodForm.subcategoryId,
        subcategory_id: prodForm.subcategoryId,
        brandId: prodForm.brandId,
        brand_id: prodForm.brandId,
        unitId: prodForm.unitId,
        unit_id: prodForm.unitId,
        currencyId: prodForm.currencyId,
        currency_id: prodForm.currencyId,
        currency: prodForm.currencyId,
        currencyCode: currencyObj ? currencyObj.code : "PKR",
        category: categoryObj ? categoryObj.name : "Pantry",
        unit: unitObj ? unitObj.name : "Piece",
        unitUr: unitObj ? unitObj.nameUr : "عدد",
        price: parseFloat(prodForm.price),
        salePrice: prodForm.salePrice ? parseFloat(prodForm.salePrice) : null,
        stockQuantity: parseInt(prodForm.stockQuantity || "0", 10),
        img: prodForm.img || "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80"
      };

      if (editingProdId) {
        await api.editProduct(editingProdId, payload);
        onNotify("Product fields updated in database safely!", "success");
        setEditingProdId(null);
      } else {
        await api.createProduct(payload);
        onNotify("New product created inside database successfully!", "success");
      }

      onRefreshProducts();
      fetchAllRelationalData();
      
      // Reset form
      const resetMatched = currenciesList.find(c => c.code.toUpperCase() === currency.toUpperCase());
      const defaultResetCurrencyId = resetMatched ? resetMatched.id : "curr-usd";
      setProdForm({
        name: "",
        nameUr: "",
        brandId: brandsList[0]?.id || "brand-general",
        categoryId: categoriesList[0]?.id || "pantry",
        subcategoryId: "",
        unitId: unitsList[0]?.id || "unit-piece",
        currencyId: defaultResetCurrencyId,
        price: "",
        salePrice: "",
        img: "",
        unit: "Piece",
        unitUr: "عدد",
        images: [],
        sku: "",
        batchNumber: "",
        manufacturingDate: "",
        expiryDate: "",
        stockQuantity: "100",
        description: "",
        status: "Active"
      });
      localStorage.removeItem("voxcart_draft_prodForm");
    } catch (err) {
      onNotify(err.message || "Operation failed", "error");
    }
  };

  const startEditProduct = (prod) => {
    setEditingProdId(prod.id);

    const foundCategory = categoriesList.find(c => 
      (prod.categoryId && c.id.toLowerCase() === prod.categoryId.toLowerCase()) || 
      (prod.category_id && c.id.toLowerCase() === prod.category_id.toLowerCase()) || 
      (prod.category && (c.name.toLowerCase() === prod.category.toLowerCase() || c.id.toLowerCase() === prod.category.toLowerCase())) ||
      (prod.category_name && c.name.toLowerCase() === prod.category_name.toLowerCase())
    );
    const finalCategoryId = foundCategory ? foundCategory.id : (prod.categoryId || prod.category_id || categoriesList[0]?.id || "Pantry");

    const foundSubcategory = subcategoriesList.find(s => 
      (prod.subcategoryId && s.id.toLowerCase() === prod.subcategoryId.toLowerCase()) || 
      (prod.subcategory_id && s.id.toLowerCase() === prod.subcategory_id.toLowerCase()) || 
      (prod.subcategoryName && s.name.toLowerCase() === prod.subcategoryName.toLowerCase()) ||
      (prod.subcategory && (s.name.toLowerCase() === prod.subcategory.toLowerCase() || s.id.toLowerCase() === prod.subcategory.toLowerCase())) ||
      (prod.sub_category && (s.name.toLowerCase() === prod.sub_category.toLowerCase() || s.id.toLowerCase() === prod.sub_category.toLowerCase())) ||
      (prod.subcategory_name && s.name.toLowerCase() === prod.subcategory_name.toLowerCase())
    );
    const finalSubcategoryId = foundSubcategory ? foundSubcategory.id : (prod.subcategoryId || prod.subcategory_id || "");

    const foundBrand = brandsList.find(b => 
      (prod.brandId && b.id.toLowerCase() === prod.brandId.toLowerCase()) || 
      (prod.brand_id && b.id.toLowerCase() === prod.brand_id.toLowerCase()) || 
      (prod.brandName && b.name.toLowerCase() === prod.brandName.toLowerCase()) ||
      (prod.brand && b.name.toLowerCase() === prod.brand.toLowerCase())
    );
    const finalBrandId = foundBrand ? foundBrand.id : (prod.brandId || prod.brand_id || brandsList[0]?.id || "brand-general");

    const foundUnit = unitsList.find(u => 
      (prod.unitId && u.id.toLowerCase() === prod.unitId.toLowerCase()) || 
      (prod.unit_id && u.id.toLowerCase() === prod.unit_id.toLowerCase()) || 
      (prod.unit && (u.name.toLowerCase() === prod.unit.toLowerCase() || u.id.toLowerCase() === prod.unit.toLowerCase()))
    );
    const finalUnitId = foundUnit ? foundUnit.id : (prod.unitId || prod.unit_id || unitsList[0]?.id || "unit-piece");

    const foundCurrency = currenciesList.find(c => 
      (prod.currencyId && c.id.toLowerCase() === prod.currencyId.toLowerCase()) || 
      (prod.currency_id && c.id.toLowerCase() === prod.currency_id.toLowerCase()) || 
      (prod.currency && (c.id.toLowerCase() === prod.currency.toLowerCase() || c.code.toLowerCase() === prod.currency.toLowerCase())) ||
      (prod.currencyCode && c.code.toLowerCase() === prod.currencyCode.toLowerCase()) ||
      (prod.currency_code && c.code.toLowerCase() === prod.currency_code.toLowerCase())
    );
    const finalCurrencyId = foundCurrency ? foundCurrency.id : (prod.currencyId || prod.currency_id || "curr-pkr");

    setProdForm({
      name: prod.name || "",
      nameUr: prod.nameUr || "",
      brandId: finalBrandId,
      categoryId: finalCategoryId,
      subcategoryId: finalSubcategoryId,
      unitId: finalUnitId,
      currencyId: finalCurrencyId,
      price: prod.price ? prod.price.toString() : "",
      salePrice: prod.salePrice ? prod.salePrice.toString() : "",
      img: prod.img || "",
      unit: prod.unit || "Piece",
      unitUr: prod.unitUr || "عدد",
      images: prod.images || [],
      sku: prod.sku || "",
      batchNumber: prod.batchNumber || "",
      manufacturingDate: prod.manufacturingDate || "",
      expiryDate: prod.expiryDate || "",
      stockQuantity: prod.stockQuantity ? prod.stockQuantity.toString() : "100",
      description: prod.description || "",
      status: prod.status || "Active"
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const cancelEditProduct = () => {
    setEditingProdId(null);
    const resetMatched = currenciesList.find(c => c.code.toUpperCase() === currency.toUpperCase());
    const defaultResetCurrencyId = resetMatched ? resetMatched.id : "curr-usd";
    setProdForm({
      name: "",
      nameUr: "",
      brandId: brandsList[0]?.id || "brand-general",
      categoryId: categoriesList[0]?.id || "Pantry",
      subcategoryId: "",
      unitId: unitsList[0]?.id || "unit-piece",
      currencyId: defaultResetCurrencyId,
      price: "",
      salePrice: "",
      img: "",
      unit: "Piece",
      unitUr: "عدد",
      images: [],
      sku: "",
      batchNumber: "",
      manufacturingDate: "",
      expiryDate: "",
      stockQuantity: "100",
      description: "",
      status: "Active"
    });
    localStorage.removeItem("voxcart_draft_prodForm");
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.deleteProduct(id);
      onNotify("Product deleted successfully", "success");
      onRefreshProducts();
    } catch (err) {
      onNotify(err.message, "error");
    }
  };

  // --- Category CRUD Actions
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name || !categoryForm.nameUr) {
      onNotify("Please provide both English and Urdu category titles.", "warning");
      return;
    }

    try {
      const payload = {
        name: categoryForm.name.trim(),
        nameUr: categoryForm.nameUr.trim()
      };

      if (editingCategory) {
        await api.updateCategory(editingCategory, payload);
        onNotify("Category updated successfully!", "success");
        setEditingCategory(null);
      } else {
        await api.createCategory(payload);
        onNotify("New product category created successfully!", "success");
      }

      setCategoryForm({ id: "", name: "", nameUr: "" });
      fetchAllRelationalData();
      onRefreshProducts();
    } catch (err) {
      onNotify(err.message || "Failed to save category.", "error");
    }
  };

  const startEditCategory = (cat) => {
    setEditingCategory(cat.id);
    setCategoryForm({
      id: cat.id,
      name: cat.name,
      nameUr: cat.nameUr
    });
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!confirm(`Warning: Deleting the category "${catName}" will remove it from the catalog. Continue?`)) return;

    try {
      await api.deleteCategory(catId);
      onNotify("Category removed successfully.", "success");
      fetchAllRelationalData();
      onRefreshProducts();
    } catch(err) {
      onNotify(err.message, "error");
    }
  };

  // --- Brand CRUD Actions
  const handleSaveBrand = async (e) => {
    e.preventDefault();
    if (!brandForm.name) {
      onNotify("Please provide a brand name.", "warning");
      return;
    }

    try {
      if (editingBrand) {
        await api.updateBrand(editingBrand, brandForm);
        onNotify("Brand updated successfully!", "success");
        setEditingBrand(null);
      } else {
        await api.createBrand(brandForm);
        onNotify("Brand created successfully!", "success");
      }

      setBrandForm({ name: "", logo: "", status: "Active" });
      fetchAllRelationalData();
      onRefreshProducts();
    } catch (err) {
      onNotify(err.message || "Failed to save brand.", "error");
    }
  };

  const startEditBrand = (b) => {
    setEditingBrand(b.id);
    setBrandForm({
      name: b.name,
      logo: b.logo || "",
      status: b.status || "Active"
    });
  };

  const handleDeleteBrand = async (brandId) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;

    try {
      await api.deleteBrand(brandId);
      onNotify("Brand deleted successfully.", "success");
      fetchAllRelationalData();
      onRefreshProducts();
    } catch (err) {
      onNotify(err.message || "Failed to delete brand.", "error");
    }
  };

  // --- Subcategory CRUD Actions
  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    if (!subcategoryForm.name || !subcategoryForm.nameUr || !subcategoryForm.categoryId) {
      onNotify("Please fill in all subcategory fields.", "warning");
      return;
    }

    try {
      if (editingSubcategory) {
        await api.updateSubcategory(editingSubcategory, subcategoryForm);
        onNotify("Subcategory updated successfully!", "success");
        setEditingSubcategory(null);
      } else {
        await api.createSubcategory(subcategoryForm);
        onNotify("Subcategory created successfully!", "success");
      }

      setSubcategoryForm({ name: "", nameUr: "", categoryId: categoriesList[0]?.id || "", status: "Active" });
      fetchAllRelationalData();
      onRefreshProducts();
    } catch (err) {
      onNotify(err.message || "Failed to save subcategory.", "error");
    }
  };

  const startEditSubcategory = (sub) => {
    setEditingSubcategory(sub.id);
    setSubcategoryForm({
      name: sub.name,
      nameUr: sub.nameUr,
      categoryId: sub.categoryId,
      status: sub.status || "Active"
    });
  };

  const handleDeleteSubcategory = async (subId) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;

    try {
      await api.deleteSubcategory(subId);
      onNotify("Subcategory deleted successfully.", "success");
      fetchAllRelationalData();
      onRefreshProducts();
    } catch (err) {
      onNotify(err.message || "Failed to delete subcategory.", "error");
    }
  };

  // --- Unit CRUD Actions
  const handleSaveUnit = async (e) => {
    e.preventDefault();
    if (!unitForm.name || !unitForm.nameUr) {
      onNotify("Please provide English and Urdu unit names.", "warning");
      return;
    }

    try {
      if (editingUnit) {
        await api.updateUnit(editingUnit, unitForm);
        onNotify("Measurement unit updated!", "success");
        setEditingUnit(null);
      } else {
        await api.createUnit(unitForm);
        onNotify("Measurement unit created successfully!", "success");
      }

      setUnitForm({ name: "", nameUr: "", status: "Active" });
      fetchAllRelationalData();
      onRefreshProducts();
    } catch (err) {
      onNotify(err.message || "Failed to save unit.", "error");
    }
  };

  const startEditUnit = (u) => {
    setEditingUnit(u.id);
    setUnitForm({
      name: u.name,
      nameUr: u.nameUr,
      status: u.status || "Active"
    });
  };

  const handleDeleteUnit = async (unitId) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;

    try {
      await api.deleteUnit(unitId);
      onNotify("Measurement unit removed.", "success");
      fetchAllRelationalData();
      onRefreshProducts();
    } catch (err) {
      onNotify(err.message || "Failed to delete unit.", "error");
    }
  };

  // --- Currency CRUD Actions
  const handleSaveCurrency = async (e) => {
    e.preventDefault();
    if (!currencyForm.name || !currencyForm.code || !currencyForm.symbol) {
      onNotify("Please fill in all currency fields.", "warning");
      return;
    }

    try {
      if (editingCurrency) {
        await api.updateCurrency(editingCurrency, currencyForm);
        onNotify("Currency settings updated!", "success");
        setEditingCurrency(null);
      } else {
        await api.createCurrency(currencyForm);
        onNotify("Currency added successfully!", "success");
      }

      setCurrencyForm({ name: "", code: "", symbol: "", status: "Active" });
      fetchAllRelationalData();
      onRefreshProducts();
    } catch (err) {
      onNotify(err.message || "Failed to save currency.", "error");
    }
  };

  const startEditCurrency = (c) => {
    setEditingCurrency(c.id);
    setCurrencyForm({
      name: c.name,
      code: c.code,
      symbol: c.symbol,
      status: c.status || "Active"
    });
  };

  const handleDeleteCurrency = async (currencyId) => {
    if (!confirm("Are you sure you want to delete this currency?")) return;

    try {
      await api.deleteCurrency(currencyId);
      onNotify("Currency deleted successfully.", "success");
      fetchAllRelationalData();
      onRefreshProducts();
    } catch (err) {
      onNotify(err.message || "Failed to delete currency.", "error");
    }
  };

  // --- Users Directory Operations
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) {
      onNotify("Please fill in required fields for registering new user.", "error");
      return;
    }

    const passCheck = validateStrongPassword(newUserForm.password);
    if (!passCheck.valid) {
      onNotify(passCheck.message, "error");
      return;
    }

    try {
      await api.createAdminUser(newUserForm);
      onNotify(`Successfully registered user "${newUserForm.name}" inside system!`, "success");
      setNewUserForm({ name: "", email: "", password: "", role: "user" });
      localStorage.removeItem("voxcart_draft_newUserForm");
      fetchUsersDirectory();
      fetchDashStats();
    } catch (err) {
      onNotify(err.message || "Failed to register user", "error");
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, status);
      onNotify(`Order ${orderId} updated to ${status}!`, "success");
      setStats(prev => ({
        ...prev,
        recentOrders: (prev.recentOrders || []).map(o => o.id === orderId ? { ...o, status } : o)
      }));
      fetchDashStats();
      fetchUsersDirectory();
      if (onRefreshOrders) onRefreshOrders();
    } catch (err) {
      onNotify(err.message, "error");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId}? This cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteOrder(orderId);
      onNotify(`Order #${orderId} deleted successfully!`, "success");
      fetchDashStats();
      fetchUsersDirectory();
      if (onRefreshOrders) onRefreshOrders();
    } catch (err) {
      onNotify(err.message || "Failed to delete order", "error");
    }
  };

  const toggleShowPassword = (userId) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleDeleteUser = async (userId) => {
    if (userId === "usr_admin" || userId === "usr_1") {
      onNotify("You are not permitted to delete seed system administrators.", "warning");
      return;
    }
    if (!confirm("Are you sure you want to permanently delete this shopper's account?")) return;
    try {
      await api.deleteAdminUser(userId);
      onNotify("User account has been deleted successfully.", "success");
      fetchUsersDirectory();
      fetchDashStats();
    } catch (e) {
      onNotify(e.message || "Failed to remove user account.", "error");
    }
  };

  // --- BULK CATALOG IMPORT OR EXPORTS
  const handleExportCatalog = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `voxcart_catalog_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onNotify("Product catalog exported to JSON dataset successfully!", "success");
    } catch (err) {
      onNotify("Failed to serialize catalog items.", "error");
    }
  };

  const handleImportJsonFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) {
          throw new Error("JSON file must be an Array of product records.");
        }

         let importCount = 0;
         for (const item of parsed) {
           if (item.name && item.price !== undefined) {
             await api.createProduct({
               name: item.name,
               nameUr: item.nameUr || item.nameUrDu || item.name_ur || item.name,
               category: item.category || item.categoryName || "Pantry",
               categoryId: item.categoryId || item.category_id,
               subcategory: item.subcategory || item.subcategoryName || item.sub_category || "",
               subcategoryId: item.subcategoryId || item.subcategory_id,
               price: parseFloat(item.price),
               salePrice: item.salePrice ? parseFloat(item.salePrice) : null,
               img: item.img || "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80",
               unit: item.unit || "pack",
               unitUr: item.unitUr || "پیکٹ",
               unitId: item.unitId || item.unit_id,
               currency: item.currency || item.currencyId || item.currency_id || item.currencyCode || "curr-pkr",
               currencyId: item.currencyId || item.currency_id,
               brand: item.brand || item.brandName || "General",
               brandId: item.brandId || item.brand_id,
               images: item.images || [],
               sku: item.sku,
               stockQuantity: item.stockQuantity !== undefined ? parseInt(item.stockQuantity, 10) : 100,
               description: item.description || ""
             });
             importCount++;
           }
         }

        onNotify(`Successfully bulkimported ${importCount} items into MySQL catalog database!`, "success");
        onRefreshProducts();
        e.target.value = ""; // clear input
      } catch (err) {
        onNotify(`Import Failed: ${err.message}`, "error");
      }
    };
    reader.readAsText(file);
  };



  // --- FILTERED PRODUCTS TO MANAGE
  const filteredProductsToManage = useMemo(() => {
    return products.filter((p) => {
      if (!p) return false;
      const query = prodFilterQuery.toLowerCase();
      const pName = p.name || "";
      const pNameUr = p.nameUr || "";
      const pCategory = p.category || "";
      const matchQuery = 
        pName.toLowerCase().includes(query) || 
        pNameUr.toLowerCase().includes(query) || 
        pCategory.toLowerCase().includes(query);
      const matchCat = prodFilterCategory === "all" || 
                       pCategory.toLowerCase() === prodFilterCategory.toLowerCase() ||
                       p.categoryId?.toLowerCase() === prodFilterCategory.toLowerCase();
      return matchQuery && matchCat;
    });
  }, [products, prodFilterQuery, prodFilterCategory]);

  // Reset page to 1 on filter changes
  useEffect(() => {
    setProdPage(1);
  }, [prodFilterQuery, prodFilterCategory, prodPageSize]);

  // Slice list for pagination
  const paginatedProducts = useMemo(() => {
    const start = (prodPage - 1) * prodPageSize;
    return filteredProductsToManage.slice(start, start + prodPageSize);
  }, [filteredProductsToManage, prodPage, prodPageSize]);

  const totalPages = Math.ceil(filteredProductsToManage.length / prodPageSize) || 1;

  return (
    <div className="py-4 flex flex-col gap-6">
      
      {/* Overview Headings */}
      <div className="border-b border-white/10 pb-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="font-display font-medium text-xl text-white mb-1 flex items-center gap-2">
            <span>🛡️</span>
            <span>{t.adminTitle}</span>
          </h2>
          <p className="text-xs text-white/45 leading-relaxed">
            Full enterprise operations privilege dashboard. Manage catalog items, categories, and secure local media uploads.
          </p>
        </div>

        {/* Sub-tab navigation chips bento index */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950/75 p-1 rounded-xl border border-white/10 w-fit">
          <button
            onClick={() => setActiveSubTab("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-200 select-none cursor-pointer ${
              activeSubTab === "overview" 
                ? "bg-emerald-500 text-slate-950 shadow-md font-black" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Overview
          </button>
          
          <button
            onClick={() => setActiveSubTab("products")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-200 select-none cursor-pointer ${
              activeSubTab === "products" 
                ? "bg-emerald-500 text-slate-950 shadow-md font-black" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Products ({products.length})
          </button>

          <button
            onClick={() => setActiveSubTab("settings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-200 select-none cursor-pointer ${
              activeSubTab === "settings" 
                ? "bg-emerald-500 text-slate-950 shadow-md font-black" 
                : "text-white/60 hover:text-white"
            }`}
          >
            ⚙️ Master Settings
          </button>

          <button
            onClick={() => setActiveSubTab("users")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-200 select-none cursor-pointer ${
              activeSubTab === "users" 
                ? "bg-emerald-500 text-slate-950 shadow-md font-black" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Users ({userList.length})
          </button>

          <button
            onClick={() => setActiveSubTab("feedback")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-200 select-none cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "feedback" 
                ? "bg-emerald-500 text-slate-950 shadow-md font-black" 
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>💬 Feedback</span>
            {feedbackList.filter(f => f.status === "Pending").length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {feedbackList.filter(f => f.status === "Pending").length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Analytics Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-300 rounded-xl border border-emerald-500/10 shrink-0">
            <DollarSign size={18} />
          </div>
          <div>
            <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">{t.adminSales}</span>
            <span className="text-base font-bold font-display text-white mt-0.5 block">
              {formatPrice(stats?.totalSalesUsd || 0, currency, lang, "USD")}
            </span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-300 rounded-xl border border-emerald-500/10 shrink-0">
            <ShoppingCart size={18} />
          </div>
          <div>
            <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">{t.adminOrders}</span>
            <span className="text-base font-bold font-display text-white mt-0.5 block">
              {stats?.orderCount || 0}
            </span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-300 rounded-xl border border-emerald-500/10 shrink-0">
            <Package size={18} />
          </div>
          <div>
            <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">{t.adminProducts}</span>
            <span className="text-base font-bold font-display text-white mt-0.5 block">
              {stats?.productCount || 0}
            </span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-300 rounded-xl border border-emerald-500/10 shrink-0">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">{t.adminUsers}</span>
            <span className="text-base font-bold font-display text-white mt-0.5 block">
              {stats?.userCount || 0}
            </span>
          </div>
        </div>
      </div>



      {/* ================= SUBTAB 1: ENTERPRISE OVERVIEW ================= */}
      {activeSubTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-in">
          {/* Recent Orders Fulfilment */}
          <div className="lg:col-span-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <h3 className="font-display font-medium text-sm text-white flex items-center gap-2">
              <ShoppingCart size={15} className="text-emerald-400" />
              <span>{t.adminRecentOrders}</span>
            </h3>

            <div className="max-h-[350px] overflow-y-auto pr-1 flex flex-col gap-2.5 scrollbar-thin scrollbar-thumb-white/10">
              {stats?.recentOrders?.length === 0 ? (
                <div className="text-center py-12 text-white/30 text-xs">No orders processed in the database yet.</div>
              ) : (
                stats?.recentOrders?.map((ro) => (
                  <div
                    key={ro.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-mono font-bold text-emerald-300">{ro.id}</span>
                        <span className="text-white/30">|</span>
                        <span className="text-white/45">
                          {new Date(ro.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono font-bold text-emerald-300 uppercase tracking-widest">
                          {ro.currency}
                        </span>
                      </div>
                       <div className="text-xs text-white/50 mt-1.5 line-clamp-1 max-w-sm">
                         Items: {Array.isArray(ro.items) ? ro.items.map(item => `${item?.name || "Item"} (${item?.qty || 1})`).join(", ") : "None"}
                       </div>
                     </div>
 
                     <div className="flex items-center gap-3 shrink-0">
                       <select
                          value={ro.status === "Pending" ? "Processing" : (ro.status || "Processing")}
                          onChange={(e) => handleUpdateOrderStatus(ro.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer outline-none bg-slate-950 ${
                            ro.status === "Delivered"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : ro.status === "Shipped"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                              : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                          }`}
                        >
                          <option value="Processing" className="text-purple-300 bg-slate-950">Processing</option>
                          <option value="Shipped" className="text-amber-400 bg-slate-950">Shipped</option>
                          <option value="Delivered" className="text-emerald-400 bg-slate-950">Delivered</option>
                        </select>
 
                       <div className="text-right min-w-[70px]">
                         <span className="font-bold text-emerald-300 text-xs block">
                           {formatPrice(typeof ro.total === "number" ? ro.total : parseFloat(ro.total || "0"), currency, lang, "USD")}
                         </span>
                       </div>

                      {ro.status !== "Shipped" && ro.status !== "Delivered" && ro.status !== "Fulfilled" && (
                        <button
                          onClick={() => handleDeleteOrder(ro.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-lg transition active:scale-95 cursor-pointer"
                          id={`btn-delete-order-${ro.id}`}
                          title="Delete order"
                        >
                          <Trash size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 2: PRODUCTS CATALOG MANAGER ================= */}
      {activeSubTab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-in">
          {/* Add / Edit Form */}
          <div className="lg:col-span-4 bg-white/5 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-5 h-fit shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-display font-medium text-sm text-white flex items-center gap-2">
                <Plus size={15} className="text-emerald-400" />
                <span>{editingProdId ? "Edit Product" : t.adminAddProduct}</span>
              </h3>
              {localStorage.getItem("voxcart_draft_prodForm") && (
                <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded text-emerald-300 uppercase tracking-widest animate-pulse font-black">
                  Draft saved
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col gap-3.5">
              {/* Product title En */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{t.productNameEn} *</label>
                <input
                  id="admin-prod-name-input"
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  placeholder="e.g. Cheddar Cheese, Basmati Rice, Whole Milk"
                  className="bg-white/5 border border-white/15 focus:border-emerald-500 focus:bg-white/10 rounded-xl px-3.5 py-2.5 text-xs outline-none text-white transition"
                />
              </div>

              {/* Product title Ur */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{t.productNameUr}</label>
                <input
                  type="text"
                  value={prodForm.nameUr}
                  onChange={(e) => setProdForm({ ...prodForm, nameUr: e.target.value })}
                  placeholder="مثال کے طور پر: پنیر"
                  className="bg-white/5 border border-white/15 focus:border-emerald-500 focus:bg-white/10 rounded-xl px-3.5 py-2.5 text-xs outline-none text-white text-right font-medium transition"
                  dir="rtl"
                />
              </div>

              {/* Brand Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Brand *</label>
                <select
                  value={prodForm.brandId}
                  onChange={(e) => setProdForm({ ...prodForm, brandId: e.target.value })}
                  className="bg-slate-950 border border-white/15 rounded-xl px-2.5 py-2.5 text-xs outline-none text-white cursor-pointer hover:bg-slate-900"
                >
                  {brandsList.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.status})</option>
                  ))}
                  {brandsList.length === 0 && (
                    <option value="brand-general">General</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Category Selection */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Main Category *</label>
                  <select
                    value={prodForm.categoryId}
                    onChange={(e) => {
                      const selectedCatId = e.target.value;
                      const selectedCat = categoriesList.find(c => c.id === selectedCatId);
                      const subcats = subcategoriesList.filter(s => s.categoryId?.toLowerCase() === selectedCatId?.toLowerCase() && s.status === "Active");
                      const defaultSubcatId = subcats.length > 0 ? subcats[0].id : "";
                      setProdForm({ 
                        ...prodForm, 
                        categoryId: selectedCatId, 
                        category: selectedCat ? selectedCat.name : "",
                        subcategoryId: defaultSubcatId
                      });
                    }}
                    className="bg-slate-950 border border-white/15 rounded-xl px-2.5 py-2.5 text-xs outline-none text-white cursor-pointer hover:bg-slate-900"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    {categoriesList.length === 0 && (
                      <option value="pantry">Pantry</option>
                    )}
                  </select>
                </div>

                {/* Subcategory Selection */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Subcategory *</label>
                  <select
                    value={prodForm.subcategoryId}
                    onChange={(e) => setProdForm({ ...prodForm, subcategoryId: e.target.value })}
                    className="bg-slate-950 border border-white/15 rounded-xl px-2.5 py-2.5 text-xs outline-none text-white cursor-pointer hover:bg-slate-900"
                    disabled={filteredSubcatsForProduct.length === 0}
                  >
                    {filteredSubcatsForProduct.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name} ({sub.nameUr})</option>
                    ))}
                    {filteredSubcatsForProduct.length === 0 && (
                      <option value="">No subcategories</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Price */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Price ({selectedCurrencyCode}) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder={`e.g. ${selectedCurrencyCode === 'PKR' ? '150' : '4.99'}`}
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="bg-white/5 border border-white/15 focus:border-emerald-500 focus:bg-white/10 rounded-xl px-2.5 py-2.5 text-xs outline-none text-white transition font-semibold"
                  />
                </div>

                {/* Sale Price */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Sale Price ({selectedCurrencyCode})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={`e.g. ${selectedCurrencyCode === 'PKR' ? '120' : '3.99'}`}
                    value={prodForm.salePrice}
                    onChange={(e) => setProdForm({ ...prodForm, salePrice: e.target.value })}
                    className="bg-white/5 border border-white/15 focus:border-emerald-500 focus:bg-white/10 rounded-xl px-2.5 py-2.5 text-xs outline-none text-white transition font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Measurement Unit */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Measurement Unit *</label>
                  <select
                    value={prodForm.unitId}
                    onChange={(e) => {
                      const u = unitsList.find(u => u.id === e.target.value);
                      setProdForm({ ...prodForm, unitId: e.target.value, unit: u ? u.name : "Piece", unitUr: u ? u.nameUr : "عدد" });
                    }}
                    className="bg-slate-950 border border-white/15 rounded-xl px-2.5 py-2.5 text-xs outline-none text-white cursor-pointer hover:bg-slate-900"
                  >
                    {unitsList.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.nameUr})</option>
                    ))}
                    {unitsList.length === 0 && (
                      <option value="unit-piece">Piece (عدد)</option>
                    )}
                  </select>
                </div>

                {/* Currency */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Currency *</label>
                  <select
                    value={prodForm.currencyId}
                    onChange={(e) => setProdForm({ ...prodForm, currencyId: e.target.value })}
                    className="bg-slate-950 border border-white/15 rounded-xl px-2.5 py-2.5 text-xs outline-none text-white cursor-pointer hover:bg-slate-900"
                  >
                    {currenciesList.map(c => (
                      <option key={c.id} value={c.id}>{c.code} ({c.symbol})</option>
                    ))}
                    {currenciesList.length === 0 && (
                      <option value="curr-usd">USD ($)</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* SKU */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">SKU</label>
                  <input
                    type="text"
                    placeholder="Auto-sku"
                    value={prodForm.sku}
                    onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                    className="bg-white/5 border border-white/15 focus:border-emerald-500 focus:bg-white/10 rounded-xl px-2.5 py-2.5 text-xs outline-none text-white transition font-mono"
                  />
                </div>

                {/* Stock Quantity */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={prodForm.stockQuantity}
                    onChange={(e) => setProdForm({ ...prodForm, stockQuantity: e.target.value })}
                    className="bg-white/5 border border-white/15 focus:border-emerald-500 focus:bg-white/10 rounded-xl px-2.5 py-2.5 text-xs outline-none text-white transition font-semibold"
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Status</label>
                  <select
                    value={prodForm.status}
                    onChange={(e) => setProdForm({ ...prodForm, status: e.target.value })}
                    className="bg-slate-950 border border-white/15 rounded-xl px-2.5 py-2.5 text-xs outline-none text-white cursor-pointer hover:bg-slate-900"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Product Description Rich Text Editor */}
              <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center justify-between">
                  <span>Product Description (Rich Text Editor)</span>
                  <span className="text-[9px] text-emerald-400 font-normal">WYSIWYG • HTML • Preview</span>
                </label>
                <RichTextEditor
                  value={prodForm.description || ""}
                  onChange={(newHtml) => setProdForm(prev => ({ ...prev, description: newHtml }))}
                  placeholder="Enter detailed product description with bold text, bullet points, headings..."
                />
              </div>

              {/* LOCAL SECURE SERVER OR MANUAL IMAGE URL CONTROLS */}
              <div className="flex flex-col gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                <label className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Product Visual Media</label>
                
                {/* Preview Thumbnail Box */}
                {prodForm.img && (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden border border-white/10 select-none shadow">
                    <img src={prodForm.img} className="w-full h-full object-cover" alt="Primary preview" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => setProdForm(prev => ({ ...prev, img: "" }))}
                      className="absolute top-1.5 right-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 cursor-pointer transition shadow"
                      title="Remove picture"
                    >
                      <Trash size={10} />
                    </button>
                    <span className="absolute bottom-1 right-1 bg-black/70 text-[8px] font-bold px-1.5 py-px rounded tracking-widest text-emerald-400 border border-emerald-500/10">
                      PRIMARY PHOTO
                    </span>
                  </div>
                )}

                {/* Drag and drop direct upload box for primary photo */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1.5 transition ${
                    dragActive 
                      ? "border-emerald-400 bg-emerald-500/10" 
                      : "border-white/10 bg-white/5 hover:border-emerald-500/30"
                  }`}
                >
                  <UploadCloud size={20} className={uploadingImage ? "animate-bounce text-emerald-400" : "text-white/40"} />
                  
                  <div className="text-[10px] font-medium text-white/70">
                    {uploadingImage ? (
                      <span className="flex items-center gap-1.5 text-emerald-300">
                        <Loader2 className="animate-spin size-3 shrink-0" /> Synchronizing image locally...
                      </span>
                    ) : (
                      <span>Drag Primary Image Here or <label className="text-emerald-300 hover:underline cursor-pointer"><input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, false)} />Browse</label></span>
                    )}
                  </div>
                </div>

                {/* Secondary Gallery Manager (Multiple Images) */}
                <div className="mt-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-bold text-white/55 uppercase tracking-wider">Multi-Image Gallery</span>
                    <label className="text-[9.5px] text-emerald-300 font-bold hover:underline cursor-pointer flex items-center gap-1">
                      <Plus size={10} /> Add to Gallery
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, true)} />
                    </label>
                  </div>

                  {prodForm.images && prodForm.images.length > 0 ? (
                    <div className="grid grid-cols-4 gap-1.5 bg-black/40 p-2 rounded-lg border border-white/5">
                      {prodForm.images.map((imgObj, idx) => (
                        <div key={idx} className="relative aspect-square rounded overflow-hidden border border-white/10 group">
                          <img src={imgObj.url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute inset-0 bg-red-600/80 hover:bg-red-700 font-black text-[9px] text-white opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2 border border-dashed border-white/5 rounded-lg text-white/20 text-[9px]">Gallery empty. Support multiple secondary product views.</div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mt-1">
                  <input
                    type="text"
                    value={prodForm.img}
                    onChange={(e) => setProdForm({ ...prodForm, img: e.target.value })}
                    placeholder="Alternatively paste image URL here..."
                    className="flex-1 bg-white/5 border border-white/15 focus:border-emerald-500 rounded-xl px-2.5 py-1.5 text-[10px] text-white font-mono outline-none min-w-0"
                  />
                  {prodForm.img && (prodForm.img.startsWith("http://") || prodForm.img.startsWith("https://")) && (
                    <button
                      type="button"
                      onClick={uploadExternalUrlToLocalServer}
                      disabled={uploadingUrl}
                      className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-[9px] font-black uppercase tracking-wider py-1.5 px-2.5 rounded-lg transition shrink-0 cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10 font-sans"
                      title="Register this remote URL on your local secure backend!"
                    >
                      {uploadingUrl ? (
                        <>
                          <Loader2 size={10} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={10} className="stroke-[2.5]" />
                          <span>Verify & Save</span>
                        </>
                      )}
                    </button>
                  )}
                  {prodForm.img?.includes("unsplash.com") && (
                    <button
                      type="button"
                      onClick={applyImageOptimization}
                      className="bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-200 border border-emerald-400/20 text-[9px] font-bold py-1.5 px-2 rounded-lg transition shrink-0 cursor-pointer"
                      title="Optimize resolution parameters"
                    >
                      Compress
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Preset product image choices */}
              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Click a Preset Product Image:</div>
                <div className="grid grid-cols-3 gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-950/45 rounded-xl border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
                  {dynamicPresetImages.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProdForm({ ...prodForm, img: s.url })}
                      className="p-1 rounded-lg bg-white/5 border border-white/5 hover:border-emerald-500 transition text-[9px] text-white/80 truncate cursor-pointer text-left flex items-center gap-1"
                    >
                      <img src={s.url} alt={s.title} className="w-4.5 h-4.5 rounded object-cover shrink-0" referrerPolicy="no-referrer" />
                      <span className="truncate">{s.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                {editingProdId && (
                  <button
                    type="button"
                    onClick={cancelEditProduct}
                    className="flex-1 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/20 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer select-none uppercase"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-6 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer text-center uppercase tracking-wider font-semibold"
                >
                  {editingProdId ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>

          {/* Product management grid list */}
          <div className="lg:col-span-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-3 gap-3">
              <h3 className="font-display font-medium text-sm text-white flex items-center gap-2">
                <Package size={15} className="text-emerald-400" />
                <span>{t.adminProductList}</span>
              </h3>
              
              <div className="flex items-center gap-2.5">
                {/* Export anchor */}
                <button
                  type="button"
                  onClick={handleExportCatalog}
                  className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/20 text-emerald-200 text-xs px-2.5 py-1.5 rounded-lg active:scale-95 transition cursor-pointer flex items-center gap-1 font-bold"
                  title="Export catalog data to JSON file"
                >
                  <Download size={12} />
                  <span>Export</span>
                </button>

                {/* Import hidden trigger */}
                <label className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/20 text-emerald-200 text-xs px-2.5 py-1.5 rounded-lg active:scale-95 transition cursor-pointer flex items-center gap-1 font-bold">
                  <Upload size={12} />
                  <span>Import</span>
                  <input type="file" className="hidden" accept=".json" onChange={handleImportJsonFile} />
                </label>
              </div>
            </div>

            {/* Filter / Search bars index */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/30 p-3 rounded-xl border border-white/5">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-white/40 uppercase font-black">Search Item Name </label>
                <input
                  type="text"
                  value={prodFilterQuery}
                  onChange={(e) => setProdFilterQuery(e.target.value)}
                  placeholder="Type name in Urdu or English..."
                  className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-white/40 uppercase font-black">Filter Category Select</label>
                <select
                  value={prodFilterCategory}
                  onChange={(e) => setProdFilterCategory(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categoriesList.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                  {categoriesList.length === 0 && (
                    <option value="Dairy">Dairy</option>
                  )}
                </select>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-white/10">
              {filteredProductsToManage.length === 0 ? (
                <div className="text-center py-24 text-white/30 text-xs">No matching products found inside database inventory.</div>
              ) : (
                paginatedProducts.map((p) => {
                  const isCustom = p.is_custom || p.id > 23;
                  const isImgUrl = typeof p.img === "string" && (p.img.startsWith("http://") || p.img.startsWith("https://") || p.img.startsWith("/"));
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-4 p-3 bg-white/5 border border-white/5 rounded-xl hover:border-emerald-400/35 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-black/45 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden relative">
                          {isImgUrl ? (
                            <img src={p.img} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-xl">{p.img || "📦"}</span>
                          )}
                          {p.images && p.images.length > 0 && (
                            <span className="absolute bottom-0 right-0 bg-emerald-500 text-[7px] font-black px-1 text-slate-950 rounded-tl uppercase">
                              +{p.images.length} G
                            </span>
                          )}
                        </div>
                        
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
                            <span>{p.name}</span>
                            <span className="text-white/45 font-semibold text-xs">({p.nameUr})</span>
                            {isCustom && (
                              <span className="text-[7px] font-black tracking-widest bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded uppercase border border-emerald-500/10">
                                Custom
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-white/50 mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-emerald-400 font-bold">{p.brandName || "General"}</span>
                            <span>•</span>
                            <span>{p.category}</span>
                            {p.subcategoryName && (
                              <>
                                <span>/</span>
                                <span className="text-white/40">{p.subcategoryName}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>per {p.unit} ({p.unitUr})</span>
                            {p.sku && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[10px] text-white/30 bg-white/5 px-1 py-px rounded">SKU: {p.sku}</span>
                              </>
                            )}
                            <span>•</span>
                            <span className={(p.stockQuantity !== undefined ? p.stockQuantity : 100) > 0 ? "text-white/45" : "text-rose-400 font-bold"}>
                              Qty: {p.stockQuantity !== undefined ? p.stockQuantity : 100}
                            </span>
                            <span>•</span>
                            <span className={`text-[9px] px-1 rounded ${p.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/45"}`}>
                              {p.status || "Active"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-sm text-emerald-300 mr-2">
                          {formatPrice(p.price, currency, lang, p.currencyCode)}
                        </span>

                        <button
                          onClick={() => startEditProduct(p)}
                          className="p-1.5 text-white/45 hover:text-emerald-300 hover:bg-white/5 rounded transition border border-transparent hover:border-white/10 cursor-pointer"
                          title="Edit product attributes"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-white/45 hover:text-red-400 hover:bg-red-500/15 rounded transition border border-transparent hover:border-red-500/20 cursor-pointer"
                          title="Delete product from database"
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {filteredProductsToManage.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/20 p-3 rounded-xl border border-white/5 mt-3 text-xs">
                <div className="text-white/45">
                  Showing <span className="text-white font-bold">{Math.min(filteredProductsToManage.length, (prodPage - 1) * prodPageSize + 1)}</span> to{" "}
                  <span className="text-white font-bold">{Math.min(filteredProductsToManage.length, prodPage * prodPageSize)}</span> of{" "}
                  <span className="text-white font-bold">{filteredProductsToManage.length}</span> products
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Page Size Selector */}
                  <div className="flex items-center gap-1.5 mr-2">
                    <span className="text-white/30 text-[10px] uppercase font-black">Size:</span>
                    <select
                      value={prodPageSize}
                      onChange={(e) => setProdPageSize(Number(e.target.value))}
                      className="bg-slate-950 border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-white outline-none cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <button
                    disabled={prodPage === 1}
                    onClick={() => setProdPage(1)}
                    className="p-1 px-2 rounded bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition font-bold disabled:cursor-not-allowed cursor-pointer animate-none"
                    title="First page"
                  >
                    &laquo;
                  </button>
                  <button
                    disabled={prodPage === 1}
                    onClick={() => setProdPage(prev => Math.max(1, prev - 1))}
                    className="p-1 px-2 rounded bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition font-bold disabled:cursor-not-allowed cursor-pointer animate-none"
                    title="Previous page"
                  >
                    &lsaquo;
                  </button>
                  
                  <span className="text-white/60 font-medium px-2">
                    Page <span className="text-emerald-300 font-bold">{prodPage}</span> of {totalPages}
                  </span>

                  <button
                    disabled={prodPage === totalPages}
                    onClick={() => setProdPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1 px-2 rounded bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition font-bold disabled:cursor-not-allowed cursor-pointer animate-none"
                    title="Next page"
                  >
                    &rsaquo;
                  </button>
                  <button
                    disabled={prodPage === totalPages}
                    onClick={() => setProdPage(totalPages)}
                    className="p-1 px-2 rounded bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition font-bold disabled:cursor-not-allowed cursor-pointer animate-none"
                    title="Last page"
                  >
                    &raquo;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SUBTAB: MASTER SETTINGS (BRANDS, CATEGORIES, SUBCATEGORIES, UNITS, CURRENCIES) ================= */}
      {activeSubTab === "settings" && (
        <MasterSettings
          lang={lang}
          categoriesList={categoriesList}
          brandsList={brandsList}
          subcategoriesList={subcategoriesList}
          unitsList={unitsList}
          currenciesList={currenciesList}
          onRefreshAll={() => {
            fetchAllRelationalData();
            onRefreshProducts();
          }}
          onNotify={onNotify}
        />
      )}

      {/* ================= SUBTAB 4: SYSTEMS USER DIRECTORY ================= */}
      {activeSubTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-in font-display">
          {/* Create User Form */}
          <div className="lg:col-span-4 bg-white/5 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-5 h-fit shadow-xl flex flex-col gap-4">
            <h3 className="font-display font-semibold text-sm text-white mb-1 flex items-center gap-2 border-b border-white/10 pb-2">
              <UserPlus size={15} className="text-emerald-400" />
              <span>Add New User Account</span>
            </h3>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-3.5">
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. Maryam Siddiqui"
                  className="bg-white/5 border border-white/15 focus:border-emerald-500 focus:bg-white/10 rounded-xl px-3.5 py-2.5 text-xs outline-none text-white transition"
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="maryam@example.com"
                  className="bg-white/5 border border-white/15 focus:border-emerald-500 focus:bg-white/10 rounded-xl px-3.5 py-2.5 text-xs outline-none text-white transition font-medium"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Secure Password *</label>
                <div className="relative">
                  <input
                    type={showAdminUserFormPass ? "text" : "password"}
                    required
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/15 focus:border-emerald-500 focus:bg-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs outline-none text-white transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminUserFormPass(!showAdminUserFormPass)}
                    className="absolute right-3 top-3 text-white/45 hover:text-white transition cursor-pointer"
                  >
                    {showAdminUserFormPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* System Roles */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">System Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="bg-slate-950 border border-white/15 rounded-xl px-2.5 py-2.5 text-xs outline-none text-white cursor-pointer hover:bg-slate-900"
                >
                  <option value="user">Regular Shopper</option>
                  <option value="admin">System Admin Privilege</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/10 cursor-pointer text-center font-semibold"
              >
                Register User Account
              </button>
            </form>
          </div>

          {/* Users List Directory */}
          <div className="lg:col-span-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
              <Users size={15} className="text-emerald-400" />
              <span>Registered Users Directory</span>
            </h3>

            <div className="max-h-[450px] overflow-y-auto pr-1 flex flex-col gap-2.5 scrollbar-thin scrollbar-thumb-white/10">
              {userList.map((user) => {
                const isAdmin = user.role === "admin";
                const revealPass = showPasswordMap[user.id] || false;
                const isSelfRegistered = user.id !== "usr_admin" && user.id !== "usr_1" && user.id !== "usr_test";
                const hasShippedOrDelivered = user.hasShippedOrDeliveredOrders || 
                  (stats?.recentOrders || []).some(o => o.userId === user.id && (o.status === "Shipped" || o.status === "Delivered"));
                return (
                  <div
                    key={user.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-black/40 border border-white/10 hover:border-emerald-400/20 rounded-xl transition animate-slide-in"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-xs uppercase shrink-0 border ${
                        isAdmin 
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/20" 
                          : "bg-indigo-500/10 text-indigo-300 border-indigo-500/10"
                      }`}>
                        {user.name ? user.name[0] : "?"}
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white flex items-center gap-1.5 flex-wrap">
                          <span>{user.name}</span>
                          <span className={`text-[7px] font-bold uppercase py-0.2 px-1.5 rounded border ${
                            isAdmin 
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/25 animate-pulse" 
                              : "bg-white/5 text-white/55 border-white/10"
                          }`}>
                            {user.role}
                          </span>
                          {isSelfRegistered && (
                            <span className="text-[7px] font-black tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-1 rounded uppercase">
                              Self-Registered
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/50 mt-1 flex flex-wrap gap-x-2 gap-y-1 font-mono">
                          <span>UID: {user.id}</span>
                          <span className="text-white/30">|</span>
                          <span className="font-semibold text-emerald-300">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Reveal credentials security triggers & Delete actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <div className="flex items-center gap-2.5 bg-slate-950/45 p-1 px-2.5 rounded-lg border border-white/5">
                        <div className="text-left font-mono">
                          <span className="text-[8px] text-white/40 block leading-none select-none">PASSWORD</span>
                          <span className="text-xs font-mono font-bold text-white leading-relaxed tracking-wider">
                            {revealPass ? user.password : "••••••••"}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => toggleShowPassword(user.id)}
                          className="text-white/40 hover:text-white transition p-1 cursor-pointer"
                          title={revealPass ? "Obscure password" : "Show password"}
                        >
                          {revealPass ? <EyeOff size={11} /> : <Eye size={11} />}
                        </button>
                      </div>

                      {user.id !== "usr_admin" && user.id !== "usr_1" && !hasShippedOrDelivered && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded border border-white/5 cursor-pointer"
                          title="Delete User Account"
                        >
                          <Trash size={12} />
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 5: FEEDBACK & COMPLAINTS MANAGEMENT ================= */}
      {activeSubTab === "feedback" && (
        <div className="flex flex-col gap-6 animate-slide-in font-display">
          {/* Top Filter Chips & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Feedback & Complaint Submissions</h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/20">
                {feedbackList.length} Total
              </span>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-white/10 text-xs font-bold">
              {["all", "pending", "replied", "complaint", "feedback", "suggestion"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFeedbackFilter(filter)}
                  className={`px-3 py-1 rounded-lg capitalize transition cursor-pointer ${
                    feedbackFilter === filter
                      ? "bg-emerald-500 text-slate-950 font-black"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Items List */}
          {feedbackList.length === 0 ? (
            <div className="p-12 text-center text-white/40 text-xs bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-2">
              <MessageSquare size={32} className="text-white/20" />
              <p>No feedback or complaints submitted yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {feedbackList
                .filter((item) => {
                  if (feedbackFilter === "pending") return item.status === "Pending";
                  if (feedbackFilter === "replied") return item.status === "Replied";
                  if (feedbackFilter === "complaint") return item.type === "complaint";
                  if (feedbackFilter === "feedback") return item.type === "feedback";
                  if (feedbackFilter === "suggestion") return item.type === "suggestion";
                  return true;
                })
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xl hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                            item.type === "complaint"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : item.type === "suggestion"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          }`}
                        >
                          {item.type}
                        </span>

                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 ${
                            item.status === "Replied"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                          }`}
                        >
                          {item.status === "Replied" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          <span>{item.status}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-white/50 font-mono">
                        <span>{item.userName} ({item.userEmail})</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                        <button
                          onClick={() => handleDeleteFeedbackItem(item.id)}
                          className="text-white/30 hover:text-red-400 p-1 transition cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Subject & Body */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-sm text-white">{item.subject}</h4>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              className={s <= item.rating ? "fill-amber-400 text-amber-400" : "text-white/20"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed bg-black/30 p-3.5 rounded-xl border border-white/5">
                        {item.message}
                      </p>
                    </div>

                    {/* Existing Response or Reply Box */}
                    {item.adminResponse ? (
                      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                          <span>Your Response:</span>
                          <span className="text-[10px] text-white/40 font-mono">
                            {item.repliedAt ? new Date(item.repliedAt).toLocaleString() : ""}
                          </span>
                        </div>
                        <p className="text-xs text-white/90 leading-relaxed pl-3 border-l-2 border-emerald-500">
                          {item.adminResponse}
                        </p>
                      </div>
                    ) : (
                      <div>
                        {replyingItem?.id === item.id ? (
                          <form onSubmit={handleAdminReplySubmit} className="flex flex-col gap-2 bg-white/5 p-3 rounded-xl border border-emerald-500/30">
                            <label className="text-xs font-bold text-emerald-400">Write Staff Response:</label>
                            <textarea
                              rows={3}
                              required
                              placeholder="Write a clear response to this user..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => { setReplyingItem(null); setReplyText(""); }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/60 hover:text-white cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={sendingReply}
                                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow transition cursor-pointer flex items-center gap-1"
                              >
                                {sendingReply ? "Sending..." : "Send Reply"}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => { setReplyingItem(item); setReplyText(""); }}
                            className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 w-fit"
                          >
                            <Send size={12} />
                            <span>Reply to Customer</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
