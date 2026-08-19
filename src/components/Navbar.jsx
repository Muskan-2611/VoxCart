import React from "react";
import { TRANSLATIONS, EXCHANGE_RATES } from "../utils/localizer";
import { Mic, RotateCcw, Heart, FileText, Settings, LogOut, Globe, DollarSign, WifiOff, ShoppingCart, Info, Home, Shield, Sparkles, MessageSquare } from "lucide-react";

export default function Navbar({
  user,
  lang,
  setLang,
  currency,
  setCurrency,
  activeTab,
  setActiveTab,
  onLogout,
  isOnline,
  ratesVersion
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS["en"];

  // ================= ADMIN SYSTEM SEPARATE HEADER =================
  if (user && user.role === "admin") {
    return (
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-amber-500/20 px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xl shadow-amber-950/20">
        {/* Brand & Privileged State */}
        <div className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center p-2 shadow-inner shadow-amber-500/10">
            <Shield size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="font-display font-black text-lg text-gradient bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent tracking-tight leading-none">
              VoxCart Admin Console
            </h1>
            <p className="text-[10px] text-amber-200/60 tracking-wider uppercase font-extrabold mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              <span>MySQL Secure Store Management</span>
            </p>
          </div>
        </div>

        {/* Current Admin Badge & Controls */}
        <div className="flex items-center gap-3">
          {/* Urdu/English translation */}
          <button
            onClick={() => setLang(lang === "en" ? "ur" : "en")}
            className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-[11px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl border border-amber-500/25 transition cursor-pointer text-amber-300 active:scale-95"
            title="Toggle language"
          >
            <Globe size={13} />
            <span>{lang === "en" ? "اردو" : "English"}</span>
          </button>

          {/* Currency Selector */}
          <div className="relative flex items-center bg-slate-900/90 rounded-xl border border-amber-500/20 px-3 py-2 text-xs gap-1.5 shadow-inner">
            <DollarSign size={13} className="text-emerald-400" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs pr-1 border-none focus:outline-none appearance-none"
            >
              {Object.entries(EXCHANGE_RATES).map(([code, rateObj]) => (
                <option key={code} value={code} className="bg-slate-950 text-white">
                  {rateObj.flag} {code}
                </option>
              ))}
            </select>
          </div>

          {/* User Account Info */}
          <div className="flex items-center gap-2.5 border-l border-amber-500/20 pl-3.5 py-0.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-xs shadow-md shadow-amber-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left text-xs leading-none hidden sm:block">
              <span className="font-bold text-white block truncate max-w-[120px]">{user.name}</span>
              <span className="text-[8px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded-md font-extrabold mt-1 inline-block uppercase tracking-widest">
                ADMINISTRATOR
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2.5 rounded-xl border border-red-500/20 transition cursor-pointer active:scale-95"
            title="Logout and lock console"
          >
            <LogOut size={14} />
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/75 backdrop-blur-2xl border-b border-white/10 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl shadow-purple-950/10">
      {/* Brand & Connection State */}
      <div 
        className="flex items-center gap-3 cursor-pointer select-none group active:scale-97 transition-transform"
        onClick={() => setActiveTab("voice")}
      >
        <div className="w-10 h-10 md:w-11 md:h-11 bg-slate-950 border border-purple-500/40 rounded-2xl flex items-center justify-center p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 group-hover:border-purple-400/80 transition-all overflow-hidden shrink-0">
          <img src="/voxcart_cart_logo.png" alt="VoxCart Logo" className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
        </div>
        <div>
          <h1 className="font-display font-black text-xl md:text-2xl text-white tracking-tight leading-none flex items-center gap-1.5">
            <span className="bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">VoxCart</span>
            <Sparkles size={14} className="text-purple-400 animate-pulse" />
          </h1>
          <p className="text-[9px] text-purple-300/80 tracking-[0.2em] uppercase font-extrabold mt-1">
            {lang === "ur" ? "بیک وقت دو زبانیں" : "BILINGUAL VOICE SHOP"}
          </p>
        </div>
        {!isOnline && (
          <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
            <WifiOff size={10} />
            <span>Offline</span>
          </span>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center bg-slate-900/80 border border-white/10 rounded-2xl p-1 gap-1 overflow-x-auto max-w-full scrollbar-none shadow-inner">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "home"
              ? "bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-md shadow-purple-500/10"
              : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent"
          }`}
        >
          <Home size={14} className={activeTab === "home" ? "text-purple-400" : ""} />
          <span>{lang === "ur" ? "ہوم" : "Home"}</span>
        </button>

        <button
          onClick={() => setActiveTab("voice")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "voice"
              ? "bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-md shadow-purple-500/10"
              : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent"
          }`}
        >
          <Mic size={14} className={activeTab === "voice" ? "text-purple-400 animate-pulse" : ""} />
          <span>{t.voiceShop}</span>
        </button>

        <button
          onClick={() => setActiveTab("browse")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "browse"
              ? "bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-md shadow-purple-500/10"
              : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent"
          }`}
        >
          <span>📦</span>
          <span>{t.browse}</span>
        </button>

        <button
          onClick={() => setActiveTab("wishlist")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "wishlist"
              ? "bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-md shadow-purple-500/10"
              : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent"
          }`}
        >
          <Heart size={14} className={activeTab === "wishlist" ? "fill-purple-400 text-purple-400" : ""} />
          <span>{t.wishlist}</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "orders"
              ? "bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-md shadow-purple-500/10"
              : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent"
          }`}
        >
          <FileText size={14} />
          <span>{t.orders}</span>
        </button>

        <button
          onClick={() => setActiveTab("feedback")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "feedback"
              ? "bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-md shadow-purple-500/10"
              : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent"
          }`}
        >
          <MessageSquare size={14} className={activeTab === "feedback" ? "text-purple-400" : ""} />
          <span>{lang === "ur" ? "فیڈ بیک" : "Feedback"}</span>
        </button>

        {user && user.role === "admin" && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "admin"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10"
                : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            <Settings size={14} />
            <span>{t.admin}</span>
          </button>
        )}
      </div>

      {/* Language, Currency & Account Actions */}
      <div className="flex items-center gap-2">
        {/* Language Selection Toggle */}
        <button
          onClick={() => setLang(lang === "en" ? "ur" : "en")}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl border border-white/10 transition cursor-pointer text-gray-200 hover:border-purple-500/30 active:scale-95"
          title="Toggle Language / زبان تبدیل کریں"
        >
          <Globe size={13} className="text-purple-400" />
          <span>{lang === "en" ? "اردو" : "English"}</span>
        </button>

        {/* Currency Selector */}
        <div className="relative flex items-center bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 px-2.5 py-2 text-xs gap-1 transition">
          <DollarSign size={13} className="text-emerald-400" />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs pr-1 border-none focus:outline-none appearance-none"
          >
            {Object.entries(EXCHANGE_RATES).map(([code, rateObj]) => (
              <option key={code} value={code} className="bg-slate-950 text-white">
                {rateObj.flag} {code}
              </option>
            ))}
          </select>
        </div>


        {/* User Badge */}
        {user && (
          <div className="hidden sm:flex items-center gap-2 border-l border-white/10 pl-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-md shadow-purple-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left text-xs leading-none">
              <span className="font-bold text-white block max-w-[80px] truncate">{user.name}</span>
              <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5 block">{user.role}</span>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 p-2 rounded-xl border border-red-500/20 hover:border-red-500/30 transition cursor-pointer active:scale-95"
          title={t.logout}
        >
          <LogOut size={14} />
        </button>
      </div>
    </nav>
  );
}

