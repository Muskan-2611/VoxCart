import React, { useState, useMemo } from "react";
import { api } from "../utils/api";
import {
  Layers,
  Building,
  FolderPlus,
  Scale,
  DollarSign,
  Plus,
  Edit3,
  Trash,
  Loader2,
  Search,
  Check,
  AlertCircle,
  X,
  Globe
} from "lucide-react";

export default function MasterSettings({
  lang = "en",
  categoriesList = [],
  brandsList = [],
  subcategoriesList = [],
  unitsList = [],
  currenciesList = [],
  onRefreshAll,
  onNotify
}) {
  const isUr = lang === "ur";

  // Sidebar / Section state: "categories" | "brands" | "subcategories" | "units" | "currencies"
  const [activeSection, setActiveSection] = useState("categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- Category Form State
  const [categoryForm, setCategoryForm] = useState({ name: "", nameUr: "" });
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  // --- Brand Form State
  const [brandForm, setBrandForm] = useState({ name: "", logo: "", status: "Active" });
  const [editingBrandId, setEditingBrandId] = useState(null);

  // --- Subcategory Form State
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: "",
    nameUr: "",
    categoryId: "",
    status: "Active"
  });
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);

  // --- Measurement Unit Form State
  const [unitForm, setUnitForm] = useState({ name: "", nameUr: "", status: "Active" });
  const [editingUnitId, setEditingUnitId] = useState(null);

  // --- Currency Form State
  const [currencyForm, setCurrencyForm] = useState({
    name: "",
    code: "",
    symbol: "",
    status: "Active"
  });
  const [editingCurrencyId, setEditingCurrencyId] = useState(null);

  // --- Reset Handlers
  const resetCategoryForm = () => {
    setCategoryForm({ name: "", nameUr: "" });
    setEditingCategoryId(null);
  };

  const resetBrandForm = () => {
    setBrandForm({ name: "", logo: "", status: "Active" });
    setEditingBrandId(null);
  };

  const resetSubcategoryForm = () => {
    setSubcategoryForm({
      name: "",
      nameUr: "",
      categoryId: categoriesList[0]?.id || "",
      status: "Active"
    });
    setEditingSubcategoryId(null);
  };

  const resetUnitForm = () => {
    setUnitForm({ name: "", nameUr: "", status: "Active" });
    setEditingUnitId(null);
  };

  const resetCurrencyForm = () => {
    setCurrencyForm({ name: "", code: "", symbol: "", status: "Active" });
    setEditingCurrencyId(null);
  };

  // --- Filtered Lists based on search query
  const filteredCategories = useMemo(() => {
    return categoriesList.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.nameUr && c.nameUr.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [categoriesList, searchQuery]);

  const filteredBrands = useMemo(() => {
    return brandsList.filter(
      (b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.status && b.status.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [brandsList, searchQuery]);

  const filteredSubcategories = useMemo(() => {
    return subcategoriesList.filter((s) => {
      const parentCat = categoriesList.find((c) => c.id === s.categoryId || c.id === s.category_id);
      return (
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.nameUr && s.nameUr.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (parentCat && parentCat.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [subcategoriesList, categoriesList, searchQuery]);

  const filteredUnits = useMemo(() => {
    return unitsList.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.nameUr && u.nameUr.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [unitsList, searchQuery]);

  const filteredCurrencies = useMemo(() => {
    return currenciesList.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currenciesList, searchQuery]);

  // ================= 1. CATEGORIES SAVE & DELETE =================
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim() || !categoryForm.nameUr.trim()) {
      onNotify(
        isUr ? "برائے مہربانی انگریزی اور اردو دونوں نام درج کریں۔" : "Both English and Urdu category titles are required.",
        "warning"
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: categoryForm.name.trim(),
        nameUr: categoryForm.nameUr.trim(),
        status: "Active"
      };

      if (editingCategoryId) {
        await api.updateCategory(editingCategoryId, payload);
        onNotify(
          isUr ? "کیٹیگری کی تفصیلات کامیابی سے اپ ڈیٹ ہو گئیں۔" : "Category details updated safely!",
          "success"
        );
      } else {
        await api.createCategory(payload);
        onNotify(
          isUr ? "نئی کیٹیگری کامیابی سے رجسٹر ہو گئی۔" : "New category added to index successfully!",
          "success"
        );
      }
      resetCategoryForm();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      onNotify(err.message || "Failed to save category", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const confirmation = window.confirm(
      isUr
        ? `کیا آپ واقعی کیٹیگری "${cat.nameUr}" کو حذف کرنا چاہتے ہیں؟`
        : `Are you sure you want to remove the category "${cat.name}"? This could affect existing products.`
    );
    if (!confirmation) return;

    try {
      await api.deleteCategory(cat.id);
      onNotify(
        isUr ? "کیٹیگری کو کامیابی سے حذف کر دیا گیا ہے۔" : "Category deleted from registry.",
        "success"
      );
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      onNotify(err.message || "Could not delete category.", "error");
    }
  };

  const startEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({ name: cat.name, nameUr: cat.nameUr || "" });
  };

  // ================= 2. BRANDS SAVE & DELETE =================
  const handleSaveBrand = async (e) => {
    e.preventDefault();
    if (!brandForm.name.trim()) {
      onNotify(isUr ? "برانڈ کا نام ضروری ہے۔" : "Brand name is required.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: brandForm.name.trim(),
        logo: brandForm.logo.trim() || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&h=150&q=80",
        status: brandForm.status
      };

      if (editingBrandId) {
        await api.updateBrand(editingBrandId, payload);
        onNotify(isUr ? "برانڈ کامیابی سے اپ ڈیٹ ہو گیا۔" : "Brand updated successfully!", "success");
      } else {
        await api.createBrand(payload);
        onNotify(isUr ? "نیا برانڈ کامیابی سے شامل ہو گیا۔" : "New brand successfully created!", "success");
      }
      resetBrandForm();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      onNotify(err.message || "Failed to save brand", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrand = async (brand) => {
    const confirmation = window.confirm(
      isUr
        ? `کیا آپ واقعی برانڈ "${brand.name}" کو حذف کرنا چاہتے ہیں؟`
        : `Delete brand "${brand.name}"? Products under this brand will default to general brand.`
    );
    if (!confirmation) return;

    try {
      await api.deleteBrand(brand.id);
      onNotify(isUr ? "برانڈ کامیابی سے حذف ہو گیا۔" : "Brand deleted successfully.", "success");
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      onNotify(err.message || "Failed to delete brand.", "error");
    }
  };

  const startEditBrand = (brand) => {
    setEditingBrandId(brand.id);
    setBrandForm({
      name: brand.name,
      logo: brand.logo || "",
      status: brand.status || "Active"
    });
  };

  // ================= 3. SUBCATEGORIES SAVE & DELETE =================
  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    const parentCatId = subcategoryForm.categoryId || categoriesList[0]?.id;
    if (!subcategoryForm.name.trim() || !subcategoryForm.nameUr.trim() || !parentCatId) {
      onNotify(
        isUr
          ? "ذیلی کیٹیگری کا نام، اردو ترجمہ، اور مرکزی کیٹیگری منتخب کرنا لازمی ہے۔"
          : "Name, Urdu translation, and Parent Category are required fields.",
        "warning"
      );
      return;
    }

    // Client-side duplicate check
    const isDuplicate = subcategoriesList.some(
      (s) =>
        (s.categoryId === parentCatId || s.category_id === parentCatId) &&
        s.name.toLowerCase().trim() === subcategoryForm.name.toLowerCase().trim() &&
        s.id !== editingSubcategoryId
    );

    if (isDuplicate) {
      const parentCat = categoriesList.find((c) => c.id === parentCatId);
      onNotify(
        isUr
          ? `یہ ذیلی کیٹیگری پہلے ہی کیٹیگری "${parentCat?.nameUr || ""}" کے تحت موجود ہے۔`
          : `Subcategory "${subcategoryForm.name}" already exists under category "${parentCat?.name || ""}"!`,
        "error"
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: subcategoryForm.name.trim(),
        nameUr: subcategoryForm.nameUr.trim(),
        categoryId: parentCatId,
        category_id: parentCatId,
        status: subcategoryForm.status
      };

      if (editingSubcategoryId) {
        await api.updateSubcategory(editingSubcategoryId, payload);
        onNotify(
          isUr ? "ذیلی کیٹیگری کامیابی سے اپ ڈیٹ ہو گئی۔" : "Subcategory updated successfully!",
          "success"
        );
      } else {
        await api.createSubcategory(payload);
        onNotify(
          isUr ? "ذیلی کیٹیگری کامیابی سے رجسٹر ہو گئی۔" : "Subcategory successfully registered!",
          "success"
        );
      }
      resetSubcategoryForm();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      onNotify(err.message || "Failed to save subcategory", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubcategory = async (sub) => {
    const confirmation = window.confirm(
      isUr
        ? `کیا آپ واقعی ذیلی کیٹیگری "${sub.nameUr}" کو حذف کرنا چاہتے ہیں؟`
        : `Delete subcategory "${sub.name}"? This cannot be undone.`
    );
    if (!confirmation) return;

    try {
      await api.deleteSubcategory(sub.id);
      onNotify(
        isUr ? "ذیلی کیٹیگری کامیابی سے حذف ہو گئی۔" : "Subcategory removed from register.",
        "success"
      );
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      onNotify(err.message || "Failed to delete subcategory.", "error");
    }
  };

  const startEditSubcategory = (sub) => {
    setEditingSubcategoryId(sub.id);
    setSubcategoryForm({
      name: sub.name,
      nameUr: sub.nameUr || "",
      categoryId: sub.categoryId || sub.category_id || categoriesList[0]?.id || "",
      status: sub.status || "Active"
    });
  };

  // ================= 4. MEASUREMENT UNITS SAVE & DELETE =================
  const handleSaveUnit = async (e) => {
    e.preventDefault();
    if (!unitForm.name.trim() || !unitForm.nameUr.trim()) {
      onNotify(
        isUr ? "انگریزی نام اور اردو ترجمہ دونوں ضروری ہیں۔" : "Both Unit name and Urdu translations are required.",
        "warning"
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: unitForm.name.trim(),
        nameUr: unitForm.nameUr.trim(),
        status: unitForm.status
      };

      if (editingUnitId) {
        await api.updateUnit(editingUnitId, payload);
        onNotify(isUr ? "پیمائش کا یونٹ اپ ڈیٹ ہو گیا۔" : "Measurement unit updated successfully!", "success");
      } else {
        await api.createUnit(payload);
        onNotify(isUr ? "نیا یونٹ کامیابی سے شامل کر لیا گیا ہے۔" : "New unit added successfully!", "success");
      }
      resetUnitForm();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      onNotify(err.message || "Failed to save measurement unit", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUnit = async (u) => {
    const confirmation = window.confirm(
      isUr
        ? `کیا آپ واقعی یونٹ "${u.nameUr}" کو حذف کرنا چاہتے ہیں؟`
        : `Delete measurement unit "${u.name}"? Products using this unit will fall back to Piece.`
    );
    if (!confirmation) return;

    try {
      await api.deleteUnit(u.id);
      onNotify(isUr ? "یونٹ کامیابی سے حذف ہو گیا۔" : "Measurement unit deleted.", "success");
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      onNotify(err.message || "Failed to delete unit.", "error");
    }
  };

  const startEditUnit = (u) => {
    setEditingUnitId(u.id);
    setUnitForm({
      name: u.name,
      nameUr: u.nameUr || "",
      status: u.status || "Active"
    });
  };

  // ================= 5. CURRENCIES SAVE & DELETE =================
  const handleSaveCurrency = async (e) => {
    e.preventDefault();
    if (!currencyForm.name.trim() || !currencyForm.code.trim() || !currencyForm.symbol.trim()) {
      onNotify(
        isUr ? "تمام شعبوں (نام، کوڈ، علامت) کو پُر کرنا لازمی ہے۔" : "Name, ISO code, and symbol are all required fields.",
        "warning"
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: currencyForm.name.trim(),
        code: currencyForm.code.trim().toUpperCase(),
        symbol: currencyForm.symbol.trim(),
        status: currencyForm.status
      };

      if (editingCurrencyId) {
        await api.updateCurrency(editingCurrencyId, payload);
        onNotify(isUr ? "کرنسی کامیابی سے اپ ڈیٹ ہو گئی۔" : "Currency settings updated successfully!", "success");
      } else {
        await api.createCurrency(payload);
        onNotify(isUr ? "نئی کرنسی کامیابی سے شامل ہو گئی۔" : "New currency registered successfully!", "success");
      }
      resetCurrencyForm();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      onNotify(err.message || "Failed to save currency", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCurrency = async (curr) => {
    if (curr.id === "curr-usd" || curr.code.toUpperCase() === "USD") {
      onNotify(isUr ? "بنیادی کرنسی (USD) کو حذف نہیں کیا جا سکتا۔" : "Base currency (USD) cannot be deleted.", "error");
      return;
    }

    const confirmation = window.confirm(
      isUr
        ? `کیا آپ واقعی کرنسی "${curr.name}" کو حذف کرنا چاہتے ہیں؟`
        : `Delete currency "${curr.name}" (${curr.code})? Catalog references will fall back to USD.`
    );
    if (!confirmation) return;

    try {
      await api.deleteCurrency(curr.id);
      onNotify(isUr ? "کرنسی کامیابی سے حذف کر دی گئی۔" : "Currency deleted successfully.", "success");
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      onNotify(err.message || "Failed to delete currency.", "error");
    }
  };

  const startEditCurrency = (curr) => {
    setEditingCurrencyId(curr.id);
    setCurrencyForm({
      name: curr.name,
      code: curr.code,
      symbol: curr.symbol,
      status: curr.status || "Active"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-in font-display">
      
      {/* SIDEBAR NAVIGATION GRID */}
      <div className="lg:col-span-3 flex flex-col gap-2.5">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-xl">
          <span className="text-[10px] text-white/40 block font-bold uppercase tracking-widest px-2.5 pb-2 border-b border-white/5">
            {isUr ? "ماسٹر کنٹرولز" : "MASTER LOOKUP DIRECTORIES"}
          </span>

          <button
            onClick={() => {
              setActiveSection("categories");
              setSearchQuery("");
            }}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
              activeSection === "categories"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers size={14} className="shrink-0" />
            <span>{isUr ? "کیٹیگریز" : "Categories"}</span>
            <span
              className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${
                activeSection === "categories"
                  ? "bg-slate-950/20 text-slate-950 font-black"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {categoriesList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSection("brands");
              setSearchQuery("");
            }}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
              activeSection === "brands"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Building size={14} className="shrink-0" />
            <span>{isUr ? "برانڈز" : "Brands"}</span>
            <span
              className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${
                activeSection === "brands"
                  ? "bg-slate-950/20 text-slate-950 font-black"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {brandsList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSection("subcategories");
              setSearchQuery("");
            }}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
              activeSection === "subcategories"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <FolderPlus size={14} className="shrink-0" />
            <span>{isUr ? "ذیلی کیٹیگریز" : "Subcategories"}</span>
            <span
              className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${
                activeSection === "subcategories"
                  ? "bg-slate-950/20 text-slate-950 font-black"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {subcategoriesList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSection("units");
              setSearchQuery("");
            }}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
              activeSection === "units"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Scale size={14} className="shrink-0" />
            <span>{isUr ? "یونٹس" : "Measurement Units"}</span>
            <span
              className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${
                activeSection === "units"
                  ? "bg-slate-950/20 text-slate-950 font-black"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {unitsList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSection("currencies");
              setSearchQuery("");
            }}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
              activeSection === "currencies"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <DollarSign size={14} className="shrink-0" />
            <span>{isUr ? "کرنسیاں" : "Currencies"}</span>
            <span
              className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${
                activeSection === "currencies"
                  ? "bg-slate-950/20 text-slate-950 font-black"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {currenciesList.length}
            </span>
          </button>
        </div>

        {/* Search Filter Widget */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-xl">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            {isUr ? "فلٹر تلاش کریں" : "DYNAMIC TEXT FILTER"}
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isUr ? "تلاش کریں..." : "Search directories..."}
              className="bg-slate-950/60 border border-white/10 rounded-xl pl-8 pr-3.5 py-2 text-xs text-white outline-none w-full focus:border-emerald-500 transition"
            />
            <Search size={12} className="text-white/30 absolute left-2.5 top-3" />
          </div>
        </div>
      </div>

      {/* DETAIL VIEWPORT WORKSPACE */}
      <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-6 h-fit">
        
        {/* SECTION 1: CATEGORIES */}
        {activeSection === "categories" && (
          <>
            {/* Form Column */}
            <div className="md:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-widest font-black text-emerald-400 border-b border-white/5 pb-3.5">
                {editingCategoryId ? "📝 Edit Category" : "➕ Create Category"}
              </h3>
              <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    Category Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g. Fresh Produce"
                    className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    Urdu Translation (اردو ترجمہ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.nameUr}
                    onChange={(e) => setCategoryForm({ ...categoryForm, nameUr: e.target.value })}
                    placeholder="مثال: تازہ پھل اور سبزیاں"
                    className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition text-right"
                    dir="rtl"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  {editingCategoryId && (
                    <button
                      type="button"
                      onClick={resetCategoryForm}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {submitting && <Loader2 size={12} className="animate-spin" />}
                    <span>{editingCategoryId ? "Update" : "Save Category"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List Column */}
            <div className="md:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-widest font-black text-white/50 border-b border-white/5 pb-3.5">
                Category Translation Registry ({filteredCategories.length})
              </h3>
              <div className="max-h-[420px] overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-white/10">
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-12 text-white/20 text-xs">No categories found matching criteria.</div>
                ) : (
                  filteredCategories.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl hover:border-emerald-500/20 transition group"
                    >
                      <div>
                        <span className="font-bold text-xs text-white block">{c.name}</span>
                        <span className="text-[10px] text-emerald-300 font-medium block mt-0.5 text-left" dir="rtl">
                          {c.nameUr}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                        <button
                          onClick={() => startEditCategory(c)}
                          className="p-1.5 text-white/40 hover:text-emerald-300 hover:bg-white/5 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c)}
                          className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* SECTION 2: BRANDS */}
        {activeSection === "brands" && (
          <>
            {/* Form Column */}
            <div className="md:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-widest font-black text-emerald-400 border-b border-white/5 pb-3.5">
                {editingBrandId ? "📝 Edit Brand" : "➕ Create Brand"}
              </h3>
              <form onSubmit={handleSaveBrand} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={brandForm.name}
                    onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                    placeholder="e.g. Mitchell's"
                    className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Logo URL</label>
                  <input
                    type="url"
                    value={brandForm.logo}
                    onChange={(e) => setBrandForm({ ...brandForm, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Lifecycle Status</label>
                  <select
                    value={brandForm.status}
                    onChange={(e) => setBrandForm({ ...brandForm, status: e.target.value })}
                    className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer transition"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-2.5 pt-2">
                  {editingBrandId && (
                    <button
                      type="button"
                      onClick={resetBrandForm}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {submitting && <Loader2 size={12} className="animate-spin" />}
                    <span>{editingBrandId ? "Update" : "Save Brand"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List Column */}
            <div className="md:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-widest font-black text-white/50 border-b border-white/5 pb-3.5">
                Brand Directory ({filteredBrands.length})
              </h3>
              <div className="max-h-[420px] overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-white/10">
                {filteredBrands.length === 0 ? (
                  <div className="text-center py-12 text-white/20 text-xs">No brands indexed in system database.</div>
                ) : (
                  filteredBrands.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-emerald-500/20 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={b.logo || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&h=150&q=80"}
                          alt={b.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-lg border border-white/5 bg-slate-950"
                        />
                        <div>
                          <span className="font-bold text-xs text-white block">{b.name}</span>
                          <span
                            className={`text-[8px] px-1.5 py-0.2 rounded border font-mono uppercase inline-block mt-1 ${
                              b.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 text-red-300 border-red-500/20"
                            }`}
                          >
                            {b.status || "Active"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                        <button
                          onClick={() => startEditBrand(b)}
                          className="p-1.5 text-white/40 hover:text-emerald-300 hover:bg-white/5 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteBrand(b)}
                          className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* SECTION 3: SUBCATEGORIES */}
        {activeSection === "subcategories" && (
          <>
            {/* Form Column */}
            <div className="md:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-widest font-black text-emerald-400 border-b border-white/5 pb-3.5">
                {editingSubcategoryId ? "📝 Edit Subcategory" : "➕ Create Subcategory"}
              </h3>
              <form onSubmit={handleSaveSubcategory} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    Parent Category Selection *
                  </label>
                  <select
                    value={subcategoryForm.categoryId}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, categoryId: e.target.value })}
                    className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer transition"
                  >
                    {categoriesList.length === 0 ? (
                      <option value="">No categories available</option>
                    ) : (
                      categoriesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    Subcategory Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={subcategoryForm.name}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                    placeholder="e.g. Yogurt & Lassi"
                    className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    Urdu Translation (اردو ترجمہ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={subcategoryForm.nameUr}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, nameUr: e.target.value })}
                    placeholder="مثال: دہی اور لسی"
                    className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition text-right"
                    dir="rtl"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Lifecycle Status</label>
                  <select
                    value={subcategoryForm.status}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, status: e.target.value })}
                    className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer transition"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-2.5 pt-2">
                  {editingSubcategoryId && (
                    <button
                      type="button"
                      onClick={resetSubcategoryForm}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {submitting && <Loader2 size={12} className="animate-spin" />}
                    <span>{editingSubcategoryId ? "Update" : "Save Subcategory"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List Column */}
            <div className="md:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-widest font-black text-white/50 border-b border-white/5 pb-3.5">
                Subcategory Translation Registry ({filteredSubcategories.length})
              </h3>
              <div className="max-h-[420px] overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-white/10">
                {filteredSubcategories.length === 0 ? (
                  <div className="text-center py-12 text-white/20 text-xs">No subcategories match.</div>
                ) : (
                  filteredSubcategories.map((s) => {
                    const parent = categoriesList.find((c) => c.id === s.categoryId || c.id === s.category_id);
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl hover:border-emerald-500/20 transition group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white block">{s.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/15 text-white/60 font-semibold">
                              {parent ? parent.name : "Unlinked"}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-300 font-medium block mt-0.5 text-left" dir="rtl">
                            {s.nameUr}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                          <button
                            onClick={() => startEditSubcategory(s)}
                            className="p-1.5 text-white/40 hover:text-emerald-300 hover:bg-white/5 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubcategory(s)}
                            className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {/* SECTION 4: MEASUREMENT UNITS */}
        {activeSection === "units" && (
          <>
            {/* Form Column */}
            <div className="md:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-widest font-black text-emerald-400 border-b border-white/5 pb-3.5">
                {editingUnitId ? "📝 Edit Unit" : "➕ Create Measurement Unit"}
              </h3>
              <form onSubmit={handleSaveUnit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Unit Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={unitForm.name}
                    onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                    placeholder="e.g. Liter"
                    className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    Urdu Translation (اردو ترجمہ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={unitForm.nameUr}
                    onChange={(e) => setUnitForm({ ...unitForm, nameUr: e.target.value })}
                    placeholder="مثال: لیٹر"
                    className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition text-right"
                    dir="rtl"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Lifecycle Status</label>
                  <select
                    value={unitForm.status}
                    onChange={(e) => setUnitForm({ ...unitForm, status: e.target.value })}
                    className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer transition"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-2.5 pt-2">
                  {editingUnitId && (
                    <button
                      type="button"
                      onClick={resetUnitForm}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {submitting && <Loader2 size={12} className="animate-spin" />}
                    <span>{editingUnitId ? "Update" : "Save Unit"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List Column */}
            <div className="md:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-widest font-black text-white/50 border-b border-white/5 pb-3.5">
                Measurement Units ({filteredUnits.length})
              </h3>
              <div className="max-h-[420px] overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-white/10">
                {filteredUnits.length === 0 ? (
                  <div className="text-center py-12 text-white/20 text-xs">No measurement units registered.</div>
                ) : (
                  filteredUnits.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl hover:border-emerald-500/20 transition group"
                    >
                      <div>
                        <span className="font-bold text-xs text-white block">{u.name}</span>
                        <span className="text-[10px] text-emerald-300 font-medium block mt-0.5 text-left" dir="rtl">
                          {u.nameUr}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                        <button
                          onClick={() => startEditUnit(u)}
                          className="p-1.5 text-white/40 hover:text-emerald-300 hover:bg-white/5 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(u)}
                          className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* SECTION 5: CURRENCIES */}
        {activeSection === "currencies" && (
          <>
            {/* Form Column */}
            <div className="md:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-widest font-black text-emerald-400 border-b border-white/5 pb-3.5">
                {editingCurrencyId ? "📝 Edit Currency" : "➕ Create Currency"}
              </h3>
              <form onSubmit={handleSaveCurrency} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Currency Name *</label>
                  <input
                    type="text"
                    required
                    value={currencyForm.name}
                    onChange={(e) => setCurrencyForm({ ...currencyForm, name: e.target.value })}
                    placeholder="e.g. Saudi Riyal"
                    className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">ISO Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={currencyForm.code}
                      onChange={(e) => setCurrencyForm({ ...currencyForm, code: e.target.value })}
                      placeholder="SAR"
                      className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition uppercase"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Symbol *</label>
                    <input
                      type="text"
                      required
                      value={currencyForm.symbol}
                      onChange={(e) => setCurrencyForm({ ...currencyForm, symbol: e.target.value })}
                      placeholder="ر.س"
                      className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Lifecycle Status</label>
                  <select
                    value={currencyForm.status}
                    onChange={(e) => setCurrencyForm({ ...currencyForm, status: e.target.value })}
                    className="bg-slate-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer transition"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-2.5 pt-2">
                  {editingCurrencyId && (
                    <button
                      type="button"
                      onClick={resetCurrencyForm}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {submitting && <Loader2 size={12} className="animate-spin" />}
                    <span>{editingCurrencyId ? "Update" : "Save Currency"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List Column */}
            <div className="md:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-widest font-black text-white/50 border-b border-white/5 pb-3.5">
                Currencies Directory ({filteredCurrencies.length})
              </h3>
              <div className="max-h-[420px] overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-white/10">
                {filteredCurrencies.length === 0 ? (
                  <div className="text-center py-12 text-white/20 text-xs">No currencies configured.</div>
                ) : (
                  filteredCurrencies.map((curr) => (
                    <div
                      key={curr.id}
                      className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl hover:border-emerald-500/20 transition group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{curr.name}</span>
                          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold px-1.5 py-0.2 rounded">
                            {curr.code}
                          </span>
                        </div>
                        <span className="text-[10px] text-white/40 block mt-1">Symbol: {curr.symbol}</span>
                      </div>

                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                        <button
                          onClick={() => startEditCurrency(curr)}
                          className="p-1.5 text-white/40 hover:text-emerald-300 hover:bg-white/5 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteCurrency(curr)}
                          disabled={curr.id === "curr-usd" || curr.code.toUpperCase() === "USD"}
                          className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Delete"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

      </div>

    </div>
  );
}
