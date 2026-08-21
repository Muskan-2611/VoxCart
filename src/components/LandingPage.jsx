import React from "react";
import { motion } from "motion/react";
import { 
  Mic, 
  Sparkles, 
  FileText, 
  Cpu, 
  CheckCircle, 
  TrendingUp, 
  Globe, 
  ShieldCheck, 
  Layers, 
  Lightbulb,
  Zap, 
  ArrowRight,
  Database,
  Search,
  ShoppingCart,
  Bot,
  MessageSquare,
  ScanLine,
  MessageSquareQuote,
  ChefHat,
  BellRing
} from "lucide-react";
import { voxyHappy, voxyIdle, voxyThinking } from "./VoxyAvatar";

export default function LandingPage({ lang, onGetStarted, currency = "USD" }) {
  const isUr = lang === "ur";

  // Motion variants for graceful staggered entrances and smooth scroll transitions
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const heroItemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 90,
        damping: 14
      }
    }
  };

  // Reusable scroll section and card entrance variants
  const sectionScrollVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1,
        delayChildren: 0.08
      }
    }
  };

  const cardItemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 16
      }
    }
  };

  const fadeInLeftVariants = {
    hidden: { opacity: 0, x: -32 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const fadeInRightVariants = {
    hidden: { opacity: 0, x: 32 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <div className="text-white bg-transparent relative select-none w-full" id="landing-page">
      {/* Immersive radial glows and abstract particles for depth */}
      <div className="absolute top-[-10%] left-[10%] w-[45vw] h-[45vw] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[6000ms]" />

      <div className="w-full flex flex-col gap-24 md:gap-32 py-4">
        
        {/* ================= HERO SECTION ================= */}
        <motion.header 
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="text-center py-12 md:py-24 flex flex-col items-center gap-8 relative"
        >
          {/* Elegant Floating Badge */}
          <motion.div 
            variants={heroItemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 via-indigo-500/15 to-purple-500/10 border border-purple-500/30 shadow-xl backdrop-blur-xl"
          >
            <Sparkles size={14} className="text-purple-400 animate-spin [animation-duration:4s]" />
            <span className="text-[10px] md:text-xs font-black tracking-widest uppercase bg-gradient-to-r from-purple-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              {isUr ? "نئی نسل کا صوتی اسٹور فرنٹ" : "Next-Generation Intelligent Audio Storefront"}
            </span>
          </motion.div>

          {/* Large Majestic Responsive Hero Heading */}
          <motion.h1 
            variants={heroItemVariants}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] max-w-5xl font-display"
          >
            {isUr ? (
              <>
                اپنی خریداری کی فہرست <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">بولیں</span>، اور سیکنڈوں میں آرڈر کریں!
              </>
            ) : (
              <>
                Speak Your Grocery List, <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-200 bg-clip-text text-transparent">Instantly</span> Added to Cart.
              </>
            )}
          </motion.h1>

          {/* Bilingual Descriptive Subtitle */}
          <motion.p 
            variants={heroItemVariants}
            className="text-gray-300/90 text-base md:text-xl max-w-3xl leading-relaxed font-normal px-4"
          >
            {isUr ? (
              "ووکس کارٹ پہلا انقلابی صوتی ایپ ہے جو اردو اور انگریزی دونوں زبانوں میں آپ کی آواز کا تجزیہ کر کے مصنوعات کو خود بخود کارٹ میں شامل کرتا ہے، مع رسید اسکیننگ اور آف لائن بیک اپ۔"
            ) : (
              "VoxCart is an ultra-modern, offline-resilient storefront. Powered by high-speed natural language parsing, it extracts natural bilingual voice commands and printed invoices, dynamically syncing matched goods directly into your checkout catalog."
            )}
          </motion.p>

          {/* Interactive Hero Action buttons */}
          <motion.div 
            variants={heroItemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 w-full px-4"
          >
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-sm tracking-wide transition-all shadow-xl shadow-purple-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2.5 border border-purple-300/30 group"
              id="hero-start-shopping"
            >
              <Mic size={18} className="animate-pulse text-white group-hover:scale-110 transition-transform" />
              <span>{isUr ? "شاپنگ اسسٹنٹ شروع کریں" : "Start Voice Shopping"}</span>
              <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#about-section"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm font-bold transition-all active:scale-95 text-center cursor-pointer hover:border-purple-500/30"
            >
              {isUr ? "مزید جانیں" : "Explore Project Details"}
            </a>
          </motion.div>

          {/* Beautiful animated micro wave visualizer */}
          <motion.div 
            variants={heroItemVariants}
            className="flex items-center gap-2 mt-10 px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-lg backdrop-blur-md"
          >
            <span className="text-xs text-purple-300/80 font-mono tracking-wider mr-2 uppercase font-bold">Audio Node Active:</span>
            <div className="flex items-center gap-1.5 h-6">
              <span className="w-1 h-3 bg-purple-400 rounded-full animate-bounce [animation-duration:1s]" />
              <span className="w-1 h-5 bg-purple-300 rounded-full animate-bounce [animation-duration:0.8s]" />
              <span className="w-1 h-6 bg-indigo-400 rounded-full animate-bounce [animation-duration:1.2s]" />
              <span className="w-1 h-4 bg-purple-400 rounded-full animate-bounce [animation-duration:0.7s]" />
              <span className="w-1 h-2 bg-indigo-300 rounded-full animate-bounce [animation-duration:1.1s]" />
            </div>
          </motion.div>
        </motion.header>


        {/* ================= ABOUT SECTION ================= */}
        <motion.section 
          id="about-section" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionScrollVariants}
          className="py-12 border-t border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          <motion.div variants={fadeInLeftVariants} className="lg:col-span-6 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 text-purple-400 text-xs font-bold tracking-widest uppercase">
              <Globe size={14} className="text-purple-400" />
              <span>{isUr ? "ہمارے بارے میں" : "About VoxCart"}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {isUr ? "صوتی شاپنگ کی دنیا کا پہلا مربوط حل" : "Breaking Language Barriers in Conversational Retail"}
            </h2>
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              {isUr ? (
                "عام ای کامرس ویب سائٹس صارفین کو نام لکھ کر تلاش کرنے پر مجبور کرتی ہیں، جو بزرگ یا معذور افراد کے لیے مشکل ہو سکتا ہے۔ ووکس کارٹ صوتی لسٹنگ کے ذریعے اس عمل کو مٹی مٹاتا ہے۔ یہ مادری زبان (اردو) اور انگریزی دونوں کو بخوبی سمجھتا ہے۔"
              ) : (
                "Traditional search engines in e-commerce force users into tedious manual searching, typing, and filtering. VoxCart reimagines this with an audio-first viewport. By using the browser's high-speed Web Speech API and our backend intelligent translation extraction, shoppers can dictate entire grocery lists in simple, colloquial language and watch their order complete dynamically."
              )}
            </p>
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              {isUr ? (
                "اگر آپ کے پاس پرانی چھپی ہوئی رسید ہے تو اس کا تصویر کھینچ کر اسکینر پر اپ لوڈ کریں، ایپ تمام اشیاء کو اسکین کر کے فوری طور پر کیٹلاگ سے جوڑ دے گی۔"
              ) : (
                "Additionally, the built-in Intelligent Bill Scanner processes printed checkout slips or physical receipts, extracting individual lines and linking them directly to matched items in our localized store catalog with robust relational fallbacks."
              )}
            </p>
          </motion.div>

          <motion.div variants={fadeInRightVariants} className="lg:col-span-6 relative flex justify-center items-center">
            {/* Visual Preview Card Frame */}
            <div className="w-full max-w-md aspect-video rounded-2xl bg-gradient-to-tr from-purple-500/10 via-indigo-500/5 to-purple-500/5 border border-purple-500/20 p-6 flex flex-col justify-between shadow-2xl shadow-purple-500/5 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">Bilingual Speech Decoder</span>
                </div>
                <span className="text-xs text-purple-400 font-mono">v2.1</span>
              </div>

              <div className="flex flex-col gap-3 my-4">
                <div className="flex items-start gap-2">
                  <span className="text-xs shrink-0 mt-0.5">🇬🇧</span>
                  <p className="text-xs italic text-white/70">"Add 3 boxes of milk, eggs, half kg tomatoes and butter"</p>
                </div>
                <div className="w-full h-[1px] bg-white/5" />
                <div className="flex items-start justify-end gap-2 text-right">
                  <p className="text-xs italic text-purple-300 font-medium font-sans">"تین پیکٹ دودھ، انڈے، آدھا کلو ٹماٹر اور مکھن شامل کریں"</p>
                  <span className="text-xs shrink-0 mt-0.5">🇵🇰</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[11px] font-mono text-purple-400 font-extrabold tracking-wider">SECURE PARSING PIPELINE</span>
                <span className="text-xs">🎙️✨</span>
              </div>
            </div>
          </motion.div>
        </motion.section>


        {/* ================= VOXY AI CHATBOT - ABOUT SECTION ================= */}
        <motion.section 
          id="voxy-about" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionScrollVariants}
          className="py-12 border-t border-white/5 flex flex-col gap-12 relative overflow-hidden"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

          <motion.div variants={cardItemVariants} className="text-center flex flex-col items-center gap-3 relative z-10">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full text-purple-300 text-xs font-bold tracking-widest uppercase shadow-lg shadow-purple-500/5">
              <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-cyan-400/50 bg-cyan-950/60 flex items-center justify-center p-0.5">
                <img src={voxyHappy} alt="Voxy AI" className="w-full h-full object-contain" />
              </div>
              <span>{isUr ? "ووکسی AI اسسٹنٹ" : "Voxy AI Companion Engine"}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-purple-300 via-indigo-200 to-purple-400 bg-clip-text text-transparent">
              {isUr ? "ووکسی AI — آپ کا 24/7 سمارٹ شاپنگ اسسٹنٹ" : "Meet Voxy AI — Your 24/7 AI-Powered Shopping Companion"}
            </h2>
            <p className="text-white/60 text-sm md:text-base max-w-3xl leading-relaxed">
              {isUr ? (
                "ووکسی (Voxy AI) والکس کارٹ کا ایک جدید اور ذہین اسسٹنٹ ہے جو آپ کی ہر شاپنگ ضرورت کو سمجھتا ہے۔ یہ اردو اور انگریزی دونوں زبانوں میں روانی سے گفتگو کرتا ہے، مصنوعات تلاش کرتا ہے، ترکیبیں بتاتا ہے، اور کارٹ کو تیزی سے منظم کرتا ہے۔"
              ) : (
                "Voxy AI is an intelligent, bilingual conversational assistant built into VoxCart. Powered by advanced Gemini AI, Voxy AI understands colloquial English and Urdu, searches store inventory, recommends recipes, checks product pricing, and modifies your shopping cart dynamically through natural conversation."
              )}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Capability Cards Grid (Lg: col-span-7) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1 */}
              <motion.div 
                variants={cardItemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-purple-500/30 transition-all flex flex-col gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Search size={20} />
                </div>
                <h3 className="font-extrabold text-base text-white">{isUr ? "مصنوعات کی اسمارٹ تلاش" : "Smart Catalog Search"}</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {isUr ? "کیٹلاگ میں قیمت، زمرہ یا برانڈ کے مطابق فوری تلاش کریں اور دستیاب ذخیرہ چیک کریں۔" : "Instant inventory search with price comparisons, category filters, and live stock availability checks."}
                </p>
              </motion.div>

              {/* Card 2 */}
              <motion.div 
                variants={cardItemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Globe size={20} />
                </div>
                <h3 className="font-extrabold text-base text-white">{isUr ? "اردو اور انگریزی سپورٹ" : "Bilingual AI Chat"}</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {isUr ? "اردو اور انگریزی میں فطری طور پر سوالات پوچھیں اور فوری جوابات حاصل کریں۔" : "Communicate naturally in English or Urdu (مکمل اردو سپورٹ) without complex query syntax."}
                </p>
              </motion.div>

              {/* Card 3 */}
              <motion.div 
                variants={cardItemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-extrabold text-base text-white">{isUr ? "ترکیب اور اجزاء کا اخراج" : "Recipe-to-Cart Assistance"}</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {isUr ? "کسی بھی ڈش کا نام بولیں (جیسے چکن بریانی) اور تمام ضروری اجزاء کو ایک کلک سے کارٹ میں لائیں۔" : "Ask for any meal recipe, get exact quantity listings, and pull required ingredients straight into your basket."}
                </p>
              </motion.div>

              {/* Card 4 */}
              <motion.div 
                variants={cardItemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-amber-500/30 transition-all flex flex-col gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <ShoppingCart size={20} />
                </div>
                <h3 className="font-extrabold text-base text-white">{isUr ? "خودکار کارٹ آپریشنز" : "Direct Cart Actions"}</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {isUr ? "اشیاء کارٹ میں شامل کریں، مقدار تبدیل کریں، کل بل کا حساب لگائیں، اور چیک آؤٹ کریں۔" : "Add or remove items, adjust weights, calculate live totals in multiple currencies, and proceed to order."}
                </p>
              </motion.div>
            </div>

            {/* Simulated Chat Interface & 3D Character Avatar Card (Lg: col-span-5) */}
            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="lg:col-span-5 bg-slate-900/90 border border-purple-500/20 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl relative overflow-hidden"
            >
              {/* Full Character Spotlight Header with 3D Mascot Avatar */}
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/30 p-4 flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 border border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center shrink-0 p-1 group hover:scale-105 transition duration-300">
                  <img src={voxyHappy} alt="Voxy AI" className="w-full h-full object-contain drop-shadow-md" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full w-fit">
                    {isUr ? "اے آئی شاپنگ اسسٹنٹ" : "AI Shopping Companion"}
                  </span>
                  <h4 className="text-lg font-black text-white flex items-center gap-2">
                    <span>Voxy AI</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                  </h4>
                  <p className="text-xs text-white/60 leading-tight">
                    {isUr ? "آپ کا والکس کارٹ سمارٹ اسسٹنٹ" : "Your dedicated, intelligent VoxCart shopping companion"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-cyan-950/80 border border-cyan-500/40 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img src={voxyHappy} alt="Voxy AI" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Voxy AI</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </h4>
                    <p className="text-[10px] text-white/50">{isUr ? "آن لائن — Gemini AI کا پاورڈ" : "Online — Powered by Gemini AI"}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  {isUr ? "24/7 فعال" : "24/7 Active"}
                </span>
              </div>

              {/* Sample Messages Bubble */}
              <div className="flex flex-col gap-3 my-1">
                <div className="self-end bg-purple-600/30 border border-purple-500/30 text-white text-xs p-3 rounded-2xl rounded-tr-none max-w-[85%] font-medium">
                  {isUr ? "مجھے بریانی کے لیے اجزاء چاہیے اور ساتھ 2 کلو ٹماٹر بھی شامل کر دیں۔" : "Show me fresh milk and tomatoes in stock with prices."}
                </div>
                <div className="self-start bg-white/5 border border-white/10 text-white/90 text-xs p-3 rounded-2xl rounded-tl-none max-w-[90%] flex flex-col gap-2">
                  <p className="leading-relaxed">
                    {isUr ? "جی بالکل! میں نے کیٹلاگ سے 'Whole Milk' (Rs 1,100) اور 2 کلو 'Tomatoes' (Rs 1,400) تلاش کر لیے ہیں۔ کیا آپ انہیں کارٹ میں شامل کرنا چاہتے ہیں؟" : "Found 2 matching items in store catalog: Whole Milk ($4.50) and Fresh Tomatoes ($2.80/kg). Would you like me to add them to your cart?"}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button 
                      onClick={onGetStarted}
                      className="text-[10px] bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      {isUr ? "کارٹ میں شامل کریں" : "+ Add 2 Items to Cart"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                <span className="flex items-center gap-1">
                  <MessageSquare size={12} className="text-purple-400" />
                  <span>{isUr ? "نچلے کونے میں ووکسی نشان دبائیں" : "Click floating Voxy avatar to chat anytime"}</span>
                </span>
                <button
                  onClick={onGetStarted}
                  className="text-xs text-purple-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{isUr ? "ابھی ووکسی سے بات چیت کریں" : "Try Voxy AI Now"}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.section>


        {/* ================= CORE HIGHLIGHT FEATURES SECTION (Bill Scanner, Feedback, Recipe Dropdown) ================= */}
        <motion.section 
          id="core-features-section" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionScrollVariants}
          className="py-12 border-t border-white/5 flex flex-col gap-10 relative overflow-hidden"
        >
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-pink-600/10 rounded-full blur-[140px] pointer-events-none" />

          <motion.div variants={cardItemVariants} className="text-center flex flex-col items-center gap-3 relative z-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 px-4 py-1.5 rounded-full text-purple-300 text-xs font-bold tracking-widest uppercase shadow-lg shadow-purple-500/5">
              <Sparkles size={14} className="text-purple-400 animate-pulse" />
              <span>{isUr ? "اہم فیچرز کی تفصیلی معلومات" : "Featured Homepage Capabilities"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-purple-300 via-indigo-200 to-purple-400 bg-clip-text text-transparent">
              {isUr ? "بل اسکینر، فیڈ بیک اور ریسپی ڈراپ ڈاؤن" : "Bill Scanner, Customer Feedback & Recipe Dropdown"}
            </h2>
            <p className="text-white/70 text-sm md:text-base max-w-3xl leading-relaxed">
              {isUr ? (
                "جانیں کہ یہ تینوں اہم فیچرز کس مقصد کے لیے بنائے گئے ہیں اور آپ کی روزمرہ شاپنگ، فیڈ بیک کی فراہمی اور مزیدار پکوانوں کی تیاری میں کس طرح فائدہ مند ہیں۔"
              ) : (
                "Detailed breakdown of how the Bill Scanner, Customer Feedback portal, and Recipe Dropdown operate to simplify bill understanding, facilitate user feedback, and provide easy recipe access."
              )}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {/* 1. BILL SCANNER */}
            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="p-7 rounded-3xl bg-slate-900/80 hover:bg-slate-900/95 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 flex flex-col justify-between gap-6 shadow-2xl hover:shadow-purple-500/10 group relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-lg group-hover:scale-110 transition-transform">
                    <ScanLine size={28} />
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
                    {isUr ? "کاغذی بل اسکینر" : "Bill Scanner"}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white group-hover:text-purple-200 transition-colors">
                    {isUr ? "1. بل اسکینر (Bill Scanner)" : "1. Bill Scanner"}
                  </h3>
                  <p className="text-xs text-purple-300/80 font-semibold mt-1">
                    {isUr ? "پرانی کاغذی رسیدوں کا خودکار تجزیہ اور آسان فہم" : "Easily Scan, Understand & Digitized Physical Bills"}
                  </p>
                </div>

                {/* Purpose */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap size={12} />
                    {isUr ? "مقصد (Purpose):" : "Purpose:"}
                  </span>
                  <p className="text-xs text-white/80 leading-relaxed">
                    {isUr ? (
                      "بل اسکینر کا مقصد صارفین کو کاغذی بلوں اور رسیدوں کو آسانی سے اسکین کرنے اور ان کی تفصیلات (اشیاء، تعداد اور قیمتوں) کو بغیر کسی زحمت کے سمجھنے کی سہولت فراہم کرنا ہے۔"
                    ) : (
                      "The Bill Scanner is designed to allow users to easily scan, read, and understand their paper bills, store checkout receipts, or invoice slips using optical OCR intelligence."
                    )}
                  </p>
                </div>

                {/* Benefits */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle size={12} />
                    {isUr ? "صارفین کے لیے فوائد (How Users Benefit):" : "How Users Benefit:"}
                  </span>
                  <ul className="text-xs text-white/80 leading-relaxed flex flex-col gap-1.5 list-disc list-inside">
                    <li>
                      {isUr ? "ٹائپنگ کیے بغیر بل کی تمام اشیاء خودکار طور پر ڈیجیٹل لسٹ میں تبدیل ہو جاتی ہیں۔" : "Easily scan paper bills without typing product names manually line-by-line."}
                    </li>
                    <li>
                      {isUr ? "بل میں موجود قیمتوں، تعداد اور کل اخراجات کو واضح طور پر سمجھیں۔" : "Clearly understand bill breakdowns, individual item prices, and calculated totals."}
                    </li>
                    <li>
                      {isUr ? "اسٹور کیٹلاگ کے ساتھ لائیو مماثلت کے بعد آسان ریویو لسٹ سے ڈائریکٹ کارٹ میں شامل کریں۔" : "Match scanned items to store catalog and confirm additions with 1-click 'Add to Cart'."}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                <span className="text-[11px] font-mono text-purple-300">VOX-OCR ENGINE</span>
                <span className="text-xs text-purple-400 font-bold">📸 📄 🛒</span>
              </div>
            </motion.div>

            {/* 2. FEEDBACK */}
            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="p-7 rounded-3xl bg-slate-900/80 hover:bg-slate-900/95 border border-indigo-500/30 hover:border-indigo-400/60 transition-all duration-300 flex flex-col justify-between gap-6 shadow-2xl hover:shadow-indigo-500/10 group relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-lg group-hover:scale-110 transition-transform">
                    <MessageSquareQuote size={28} />
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">
                    {isUr ? "کسٹمر پورٹل" : "User Portal"}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white group-hover:text-indigo-200 transition-colors">
                    {isUr ? "2. فیڈ بیک سیکشن (Feedback)" : "2. Customer Feedback Portal"}
                  </h3>
                  <p className="text-xs text-indigo-300/80 font-semibold mt-1">
                    {isUr ? "تجاویز، تبصرے اور رائے شیئر کرنے کا آسان راستہ" : "Simple Way for Users to Share Suggestions & Comments"}
                  </p>
                </div>

                {/* Purpose */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap size={12} />
                    {isUr ? "مقصد (Purpose):" : "Purpose:"}
                  </span>
                  <p className="text-xs text-white/80 leading-relaxed">
                    {isUr ? (
                      "فیڈ بیک سیکشن کا مقصد صارفین کو اپنی تجاویز، رائے، تبصرے، درجہ بندی یا درپیش مسائل شیئر کرنے کا ایک انتہائی سادہ اور شفاف طریقہ فراہم کرنا ہے۔"
                    ) : (
                      "The Feedback section provides a simple, direct, and user-friendly way for shoppers to share their suggestions, comments, reviews, or report difficulties."
                    )}
                  </p>
                </div>

                {/* Benefits */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle size={12} />
                    {isUr ? "صارفین کے لیے فوائد (How Users Benefit):" : "How Users Benefit:"}
                  </span>
                  <ul className="text-xs text-white/80 leading-relaxed flex flex-col gap-1.5 list-disc list-inside">
                    <li>
                      {isUr ? "نئے مصنوعات یا فیچرز کی فرمائش براہ راست سپورٹ ٹیم تک پہنچائیں۔" : "Easily submit feature ideas or request new grocery items."}
                    </li>
                    <li>
                      {isUr ? "اپنے بھیجے گئے فیڈ بیک پر ایڈمن کے لائیو جوابات اور اسٹیٹس (Resolved) ٹریک کریں۔" : "View verified official admin responses and resolution status updates."}
                    </li>
                    <li>
                      {isUr ? "آپ کے تاثرات سے صوتی اسسٹنٹ اور ویب سائٹ کا تجربہ مسلسل بہتر ہوتا ہے۔" : "Help continuously refine voice shopping accuracy and overall user experience."}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                <span className="text-[11px] font-mono text-indigo-300">COMMUNITY-VOICE</span>
                <span className="text-xs text-indigo-400 font-bold">💬 ⭐ 📢</span>
              </div>
            </motion.div>

            {/* 3. RECIPE DROPDOWN */}
            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="p-7 rounded-3xl bg-slate-900/80 hover:bg-slate-900/95 border border-emerald-500/30 hover:border-emerald-400/60 transition-all duration-300 flex flex-col justify-between gap-6 shadow-2xl hover:shadow-emerald-500/10 group relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-lg group-hover:scale-110 transition-transform">
                    <ChefHat size={28} />
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                    {isUr ? "ریسپی اسسٹنٹ" : "Recipe Dropdown"}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white group-hover:text-emerald-200 transition-colors">
                    {isUr ? "3. ریسپی ڈراپ ڈاؤن (Recipe Dropdown)" : "3. Recipe Dropdown"}
                  </h3>
                  <p className="text-xs text-emerald-300/80 font-semibold mt-1">
                    {isUr ? "ترکیبیں تلاش کرنے اور ان تک رسائی حاصل کرنے کا آسان ڈراپ ڈاؤن" : "Easy Way to Explore, Search & Access Meal Recipes"}
                  </p>
                </div>

                {/* Purpose */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap size={12} />
                    {isUr ? "مقصد (Purpose):" : "Purpose:"}
                  </span>
                  <p className="text-xs text-white/80 leading-relaxed">
                    {isUr ? (
                      "ریسپی ڈراپ ڈاؤن کا مقصد صارفین کو مختلف پکوانوں (جیسے چکن بریانی، پاستا، پیزا، کڑاہی وغیرہ) کو تلاش کرنے، دیکھنے اور ان کے اجزاء تک آسانی سے رسائی حاصل کرنے کا آسان طریقہ فراہم کرنا ہے۔"
                    ) : (
                      "The Recipe Dropdown offers an easy interactive way for shoppers to explore, search, and access a rich library of delicious meal recipes."
                    )}
                  </p>
                </div>

                {/* Benefits */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle size={12} />
                    {isUr ? "صارفین کے لیے فوائد (How Users Benefit):" : "How Users Benefit:"}
                  </span>
                  <ul className="text-xs text-white/80 leading-relaxed flex flex-col gap-1.5 list-disc list-inside">
                    <li>
                      {isUr ? "کسی بھی ڈش کی ترکیب، ضروری اجزاء اور پکانے کا طریقہ ایک کلک پر دیکھیں۔" : "Effortlessly explore new recipes and access step-by-step cooking guides."}
                    </li>
                    <li>
                      {isUr ? "اسٹور کیٹلاگ سے تمام ضروری اجزاء کی لائیو قیمت اور موجودگی چیک کریں۔" : "Check real-time ingredient availability and prices from store inventory."}
                    </li>
                    <li>
                      {isUr ? "الگ الگ اشیاء تلاش کیے بغیر تمام مطلوبہ اجزاء کو ایک کلک سے کارٹ میں شامل کریں۔" : "Auto-add all required recipe ingredients straight into the shopping cart in 1-click."}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                <span className="text-[11px] font-mono text-emerald-300">CULINARY-DROPDOWN</span>
                <span className="text-xs text-emerald-400 font-bold">🍲 🥗 🛒</span>
              </div>
            </motion.div>
          </div>
        </motion.section>


        {/* ================= FEATURES SECTION (Bento Grid) ================= */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionScrollVariants}
          className="py-12 border-t border-white/5 flex flex-col gap-12"
        >
          <motion.div variants={cardItemVariants} className="text-center flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 text-purple-400 text-xs font-bold tracking-widest uppercase">
              <Sparkles size={14} className="text-purple-400" />
              <span>{isUr ? "خصوصیات" : "Interactive Features"}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {isUr ? "جدید ترین شاپنگ ٹیکنالوجی کا مجموعہ" : "Engineered for Extreme Speed & Simplicity"}
            </h2>
            <p className="text-white/50 text-sm max-w-2xl">
              {isUr ? "ہمارے تمام فیچرز موبائل اور ڈیسک ٹاپ دونوں پر بہترین کام کرنے کے لیے ڈیزائن کیے گئے ہیں۔" : "A unified suite of accessible tools designed to simplify grocery catalog navigation."}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Intelligent Voice Extraction */}
            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic size={20} className="text-purple-400" />
              </div>
              <h3 className="font-extrabold text-xl text-white group-hover:text-purple-200 transition-colors">{isUr ? "صوتی لسٹ نکالنا (بیک وقت)" : "Voice-to-Cart Pipeline"}</h3>
              <p className="text-xs md:text-sm leading-relaxed text-white/60">
                {isUr ? (
                  "ہماری جدید AI اسپیچ پائپ لائن بولے گئے الفاظ کو فوری کارٹ اشیاء میں تبدیل کرتی ہے، جس میں تعداد اور اوزان کی خود بخود شناخت ہوتی ہے۔"
                ) : (
                  "Stream audio in real-time. The intelligent backend processes complex multi-item transcripts, extracts weights/units, and maps items instantly to checkout drafts."
                )}
              </p>
            </motion.div>

            {/* Feature 2: Smart Fuzzy Matching */}
            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Search size={20} className="text-indigo-400" />
              </div>
              <h3 className="font-extrabold text-xl text-white group-hover:text-indigo-200 transition-colors">{isUr ? "اسمارٹ فزی میچنگ" : "Smart Fuzzy Matching"}</h3>
              <p className="text-xs md:text-sm leading-relaxed text-white/60">
                {isUr ? (
                  "واحد و جمع کی تفریق، معمولی املا کی غلطیاں، اور انگریزی-اردو ناموں کے تضاد کو اسمارٹ فزی مماثلت کے ذریعے حل کیا جاتا ہے۔"
                ) : (
                  "Robust spell-checking with tailored Levenshtein metric calculations. Understands singulars, plurals, Roman Urdu synonyms, and direct bilingual translations."
                )}
              </p>
            </motion.div>

            {/* Feature 3: AI Invoice Scan */}
            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText size={20} className="text-emerald-400" />
              </div>
              <h3 className="font-extrabold text-xl text-white group-hover:text-emerald-200 transition-colors">{isUr ? "رسیدوں کا اسکینر" : "Intelligent Bill Scanner"}</h3>
              <p className="text-xs md:text-sm leading-relaxed text-white/60">
                {isUr ? (
                  "پرانی کاغذی رسیدوں کی تصویر اپ لوڈ کریں، اور سیکنڈوں میں تمام اشیاء کی ورچوئل فہرست کو حاصل کریں۔"
                ) : (
                  "Upload any historical checkout receipt or paper invoice. The optical scanner parses each line-item, quantity, and price, syncing them with the virtual catalog."
                )}
              </p>
            </motion.div>

            {/* Feature 4: Hybrid Database Architecture */}
            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Database size={20} className="text-blue-400" />
              </div>
              <h3 className="font-extrabold text-xl text-white group-hover:text-blue-200 transition-colors">{isUr ? "آف لائن کیشے بیک اپ" : "Offline Cache Storage"}</h3>
              <p className="text-xs md:text-sm leading-relaxed text-white/60">
                {isUr ? (
                  "انٹرنیٹ منقطع ہونے کی صورت میں بھی ایپ پوری صلاحیت کے ساتھ چلتی ہے اور کارٹ ڈیٹا کو محفوظ رکھتی ہے تاکہ کچھ ضائع نہ ہو۔"
                ) : (
                  "Completely offline-resilient. Local browsing, favorites, and cart additions run smoothly in transient cache modes, synchronizing when connectivity is restored."
                )}
              </p>
            </motion.div>

            {/* Feature 5: Real-time Multi-Currency Conversion */}
            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe size={20} className="text-amber-400" />
              </div>
              <h3 className="font-extrabold text-xl text-white group-hover:text-amber-200 transition-colors">{isUr ? "براہ راست کرنسی تبادلہ" : "Live Conversion Rates"}</h3>
              <p className="text-xs md:text-sm leading-relaxed text-white/60">
                {isUr ? (
                  "براہ راست ڈالر اور روپے (USD/PKR) میں تبدیلی، جو اسٹیٹ فلو کے تحت ریئل ٹائم مانیٹرنگ کی سہولت فراہم کرتی ہے۔"
                ) : (
                  "Instantly swap pricing between USD, PKR, or Euros with live automated central bank exchange proxies, securing localized store accuracy."
                )}
              </p>
            </motion.div>

            {/* Feature 6: Advanced Diagnostic Logger */}
            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Cpu size={20} className="text-red-400" />
              </div>
              <h3 className="font-extrabold text-xl text-white group-hover:text-red-200 transition-colors">{isUr ? "ترجیحی ڈائگناسٹک لاگز" : "Real-time Auditing Logs"}</h3>
              <p className="text-xs md:text-sm leading-relaxed text-white/60">
                {isUr ? (
                  "صوتی ریکارڈ کی ڈیبگنگ اور تجزیے کے لیے ریئل ٹائم کنسول ریکارڈنگ، جو عمل کو مکمل شفاف بناتی ہے۔"
                ) : (
                  "Detailed debug event consoles display speech confidence scores, exact extracted tokens, and processing durations as you speak."
                )}
              </p>
            </motion.div>
          </div>
        </motion.section>


        {/* ================= HOW IT WORKS SECTION ================= */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionScrollVariants}
          className="py-12 border-t border-white/5 flex flex-col gap-12"
        >
          <motion.div variants={cardItemVariants} className="text-center flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 text-purple-400 text-xs font-bold tracking-widest uppercase">
              <Layers size={14} className="text-purple-400" />
              <span>{isUr ? "طریقہ کار" : "How It Works"}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {isUr ? "چار آسان مراحل میں شاپنگ مکمل کریں" : "Four Steps to Instant Order Fulfillment"}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="flex flex-col gap-3.5 p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative hover:border-purple-500/20 transition-all group"
            >
              <span className="text-6xl font-black text-purple-500/10 font-mono group-hover:text-purple-500/20 transition-colors">01</span>
              <h4 className="font-extrabold text-lg text-white group-hover:text-purple-300 transition-colors">{isUr ? "لسٹ بولیں یا اسکین کریں" : "Speak or Upload"}</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                {isUr ? "آواز کا اسسٹنٹ مائیک دبائیں اور فہرست بولیں، یا رسید اسکینر کے ذریعے پرانی لسٹ اپ لوڈ کریں۔" : "Tap the glowing microphone and list your items casually, or upload a photo of a printed receipt."}
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="flex flex-col gap-3.5 p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative hover:border-indigo-500/20 transition-all group"
            >
              <span className="text-6xl font-black text-indigo-500/10 font-mono group-hover:text-indigo-500/20 transition-colors">02</span>
              <h4 className="font-extrabold text-lg text-white group-hover:text-indigo-300 transition-colors">{isUr ? "AI تجزیہ اور فزی میچنگ" : "Natural Parser Engine"}</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                {isUr ? "سستم صوتی متن کا گہرائی سے تجزیہ کر کے دکان کی مصنوعات سے اسمارٹ فزی مماثلت کرتا ہے۔" : "Our language model processes the string, normalizes quantities, matches with database inventories, and resolves synonyms."}
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="flex flex-col gap-3.5 p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative hover:border-emerald-500/20 transition-all group"
            >
              <span className="text-6xl font-black text-emerald-500/10 font-mono group-hover:text-emerald-500/20 transition-colors">03</span>
              <h4 className="font-extrabold text-lg text-white group-hover:text-emerald-300 transition-colors">{isUr ? "کارٹ کا خودکار جائزہ" : "Verify Live Extractions"}</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                {isUr ? "دستیاب مصنوعات اور غیر دستیاب مصنوعات کو الگ الگ خانوں میں دکھایا جاتا ہے جہاں ترمیم ممکن ہے۔" : "Review parsed checkout drafts. View matched catalog items and unlisted items separated cleanly, allowing custom quantities."}
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="flex flex-col gap-3.5 p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative hover:border-purple-500/20 transition-all group"
            >
              <span className="text-6xl font-black text-purple-500/10 font-mono group-hover:text-purple-500/20 transition-colors">04</span>
              <h4 className="font-extrabold text-lg text-white group-hover:text-purple-300 transition-colors">{isUr ? "تیز ترین چیک آؤٹ" : "Secure Checkout"}</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                {isUr ? "واحد کلک سے ملٹی کرنسی میں انوائس تیار کریں اور محفوظ ادائیگی مکمل کریں۔" : "Confirm details, swap currencies instantly, and generate detailed PDF checkout invoices with live system logging."}
              </p>
            </motion.div>
          </div>
        </motion.section>


        {/* ================= BENEFITS SECTION ================= */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionScrollVariants}
          className="py-12 border-t border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          <motion.div variants={fadeInLeftVariants} className="lg:col-span-6 order-2 lg:order-1 relative flex justify-center items-center">
            {/* Visual Indicators Group */}
            <div className="relative w-full max-w-sm flex flex-col gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-4 hover:border-purple-500/30 transition-all">
                <CheckCircle size={20} className="text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-base">{isUr ? "98 فیصد صوتی تسلیم کرنا" : "98% Speech Conversion Rate"}</h4>
                  <p className="text-xs text-white/50 mt-1">{isUr ? "شور شرابے والے ماحول میں بھی بالکل ٹھیک سمجھے۔" : "Accurately extracts multi-item shopping lists even in noisy, active environments."}</p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-4 hover:border-purple-500/30 transition-all">
                <CheckCircle size={20} className="text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-base">{isUr ? "مادری اردو سپورٹ" : "Native Urdu Recognition"}</h4>
                  <p className="text-xs text-white/50 mt-1">{isUr ? "بغیر کسی دقت کے اردو اشیاء کارٹ میں لائیں۔" : "Unlocks accessibility for Urdu speakers, automatically matching localized terms and custom weight conversions."}</p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-4 hover:border-purple-500/30 transition-all">
                <CheckCircle size={20} className="text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-base">{isUr ? "انوینٹری کا خودکار انتظام" : "Dynamic Catalog Lookup"}</h4>
                  <p className="text-xs text-white/50 mt-1">{isUr ? "کیٹلاگ کے ساتھ لائیو مماثلت اور انوینٹری کنٹرول۔" : "Dynamically matches speech to actual store databases, instantly identifying matching pricing and weight standards."}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInRightVariants} className="lg:col-span-6 order-1 lg:order-2 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 text-purple-400 text-xs font-bold tracking-widest uppercase">
              <TrendingUp size={14} className="text-purple-400" />
              <span>{isUr ? "فوائد" : "Why Choose VoxCart?"}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {isUr ? "شاپنگ کے عمل کو آسان ترین بنائیں" : "Frictionless Conversational Purchasing"}
            </h2>
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              {isUr ? (
                "ووکس کارٹ محض ایک تفریحی شاپنگ ایپ نہیں بلکہ ایک پائیدار اور وقت بچانے والا اسسٹنٹ ہے۔ یہ روایتی ویب سائٹس کے مقابلے میں خریداری کا وقت 70 فیصد تک کم کرتا ہے۔"
              ) : (
                "VoxCart dramatically streamlines purchasing for shoppers of all abilities. By transitioning from tedious manual product browsing to a single unified verbal dictation, shopping sessions are reduced by over 70% while keeping complete transaction accuracy."
              )}
            </p>
          </motion.div>
        </motion.section>


        {/* ================= FUTURE SCOPE / SMART EXTENSIONS ================= */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionScrollVariants}
          className="py-12 border-t border-white/5 flex flex-col gap-12"
        >
          <motion.div variants={cardItemVariants} className="text-center flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 text-purple-400 text-xs font-bold tracking-widest uppercase">
              <Lightbulb size={14} className="text-purple-400" />
              <span>{isUr ? "مستقبل کا دائرہ کار" : "Future Horizons"}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {isUr ? "آنے والے شاندار اپ ڈیٹس" : "Expanding the Power of Voice Shopping"}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Replaced Dietary Intelligence with Voxy Autonomous Shopping Copilot */}
            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-cyan-500/30 transition-all duration-300 flex flex-col gap-3 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                  <Cpu size={22} className="text-cyan-400" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 bg-cyan-500/15 border border-cyan-400/30 px-2.5 py-0.5 rounded-full">
                  {isUr ? "ووکسی سمارٹ کوپائلٹ" : "Voxy Smart Copilot"}
                </span>
              </div>
              <h4 className="font-extrabold text-lg text-white group-hover:text-cyan-200 transition-colors">
                {isUr ? "ووکسی سمارٹ شاپنگ کوپائلٹ" : "Voxy Autonomous Shopping Copilot"}
              </h4>
              <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                {isUr ? (
                  "آپ کی پچھلی خریداریوں، کچن کی ضروریات اور بجٹ کا ذہین تجزیہ کر کے ضروری راشن کے خودکار ری فل الرٹس، لائیو ڈسکاؤنٹ اطلاعات اور بچت کی تجاویز پیش کرے گا۔"
                ) : (
                  "Proactive pantry tracking and intelligent restocking alerts powered by Voxy AI. Automatically predicts household grocery replenishment cycles, tracks monthly grocery budgets, and suggests real-time price-drop savings."
                )}
              </p>
            </motion.div>

            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col gap-3 group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                <ChefHat size={22} className="text-purple-400" />
              </div>
              <h4 className="font-extrabold text-lg text-white group-hover:text-purple-200 transition-colors">{isUr ? "ترکیب سے کارٹ کا اخراج" : "Recipe-to-Cart Parsing"}</h4>
              <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                {isUr ? "صرف کسی پکوان کا نام بولیں (جیسے بریانی) اور اس کے تمام اجزاء خود بخود کارٹ میں آ جائیں گے۔" : "Just name a recipe like 'Chicken Biryani' or 'Pancakes' and watch the system automatically pull all necessary ingredients into your cart."}
              </p>
            </motion.div>

            <motion.div 
              variants={cardItemVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-indigo-500/30 transition-all duration-300 flex flex-col gap-3 group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
                <Globe size={22} className="text-indigo-400" />
              </div>
              <h4 className="font-extrabold text-lg text-white group-hover:text-indigo-200 transition-colors">{isUr ? "موبائل ایپس" : "Native Mobile Clients"}</h4>
              <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                {isUr ? "آئی او ایس اور اینڈرائیڈ کے لیے خوبصورت مٹیریل ڈيزائن پر مبنی آفیشل صوتی شاپنگ ایپس۔" : "Native iOS and Android clients with integrated neural modules to capture speech patterns offline with zero packet loss."}
              </p>
            </motion.div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
