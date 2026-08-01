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
  ShoppingCart
} from "lucide-react";

export default function LandingPage({ lang, onGetStarted, currency = "USD" }) {
  const isUr = lang === "ur";

  // Framer motion variants for graceful staggered entrances
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
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

  return (
    <div className="text-white bg-transparent relative select-none w-full" id="landing-page">
      {/* Immersive radial glows and abstract particles for depth */}
      <div className="absolute top-[-10%] left-[10%] w-[45vw] h-[45vw] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[6000ms]" />

      <div className="w-full flex flex-col gap-24 md:gap-32 py-4">
        
        {/* ================= HERO SECTION ================= */}
        <motion.header 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center py-12 md:py-24 flex flex-col items-center gap-8 relative"
        >
          {/* Elegant Floating Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 via-indigo-500/15 to-purple-500/10 border border-purple-500/30 shadow-xl backdrop-blur-xl"
          >
            <Sparkles size={14} className="text-purple-400 animate-spin [animation-duration:4s]" />
            <span className="text-[10px] md:text-xs font-black tracking-widest uppercase bg-gradient-to-r from-purple-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              {isUr ? "نئی نسل کا صوتی اسٹور فرنٹ" : "Next-Generation Intelligent Audio Storefront"}
            </span>
          </motion.div>

          {/* Large Majestic Responsive Hero Heading */}
          <motion.h1 
            variants={itemVariants}
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
            variants={itemVariants}
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
            variants={itemVariants}
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
            variants={itemVariants}
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
        <section id="about-section" className="py-12 border-t border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
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
          </div>

          <div className="lg:col-span-6 relative flex justify-center items-center">
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
          </div>
        </section>


        {/* ================= FEATURES SECTION (Bento Grid) ================= */}
        <section className="py-12 border-t border-white/5 flex flex-col gap-12">
          <div className="text-center flex flex-col items-center gap-3">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Intelligent Voice Extraction */}
            <div className="p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Mic size={20} className="text-purple-400" />
              </div>
              <h3 className="font-extrabold text-xl">{isUr ? "صوتی لسٹ نکالنا (بیک وقت)" : "Voice-to-Cart Pipeline"}</h3>
              <p className="text-xs md:text-sm leading-relaxed text-white/60">
                {isUr ? (
                  "ہماری جدید AI اسپیچ پائپ لائن بولے گئے الفاظ کو فوری کارٹ اشیاء میں تبدیل کرتی ہے، جس میں تعداد اور اوزان کی خود بخود شناخت ہوتی ہے۔"
                ) : (
                  "Stream audio in real-time. The intelligent backend processes complex multi-item transcripts, extracts weights/units, and maps items instantly to checkout drafts."
                )}
              </p>
            </div>

            {/* Feature 2: Smart Fuzzy Matching */}
            <div className="p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Search size={20} className="text-indigo-400" />
              </div>
              <h3 className="font-extrabold text-xl">{isUr ? "اسمارٹ فزی میچنگ" : "Smart Fuzzy Matching"}</h3>
              <p className="text-xs md:text-sm leading-relaxed text-white/60">
                {isUr ? (
                  "واحد و جمع کی تفریق، معمولی املا کی غلطیاں، اور انگریزی-اردو ناموں کے تضاد کو اسمارٹ فزی مماثلت کے ذریعے حل کیا جاتا ہے۔"
                ) : (
                  "Robust spell-checking with tailored Levenshtein metric calculations. Understands singulars, plurals, Roman Urdu synonyms, and direct bilingual translations."
                )}
              </p>
            </div>

            {/* Feature 3: AI Invoice Scan */}
            <div className="p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <FileText size={20} className="text-emerald-400" />
              </div>
              <h3 className="font-extrabold text-xl">{isUr ? "رسیدوں کا اسکینر" : "Intelligent Bill Scanner"}</h3>
              <p className="text-xs md:text-sm leading-relaxed text-white/60">
                {isUr ? (
                  "پرانی کاغذی رسیدوں کی تصویر اپ لوڈ کریں، اور سیکنڈوں میں تمام اشیاء کی ورچوئل فہرست کو حاصل کریں۔"
                ) : (
                  "Upload any historical checkout receipt or paper invoice. The optical scanner parses each line-item, quantity, and price, syncing them with the virtual catalog."
                )}
              </p>
            </div>

            {/* Feature 4: Hybrid Database Architecture */}
            <div className="p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Database size={20} className="text-blue-400" />
              </div>
              <h3 className="font-extrabold text-xl">{isUr ? "آف لائن کیشے بیک اپ" : "Offline Cache Storage"}</h3>
              <p className="text-xs md:text-sm leading-relaxed text-white/60">
                {isUr ? (
                  "انٹرنیٹ منقطع ہونے کی صورت میں بھی ایپ پوری صلاحیت کے ساتھ چلتی ہے اور کارٹ ڈیٹا کو محفوظ رکھتی ہے تاکہ کچھ ضائع نہ ہو۔"
                ) : (
                  "Completely offline-resilient. Local browsing, favorites, and cart additions run smoothly in transient cache modes, synchronizing when connectivity is restored."
                )}
              </p>
            </div>

            {/* Feature 5: Real-time Multi-Currency Conversion */}
            <div className="p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Globe size={20} className="text-amber-400" />
              </div>
              <h3 className="font-extrabold text-xl">{isUr ? "براہ راست کرنسی تبادلہ" : "Live Conversion Rates"}</h3>
              <p className="text-xs md:text-sm leading-relaxed text-white/60">
                {isUr ? (
                  "براہ راست ڈالر اور روپے (USD/PKR) میں تبدیلی، جو اسٹیٹ فلو کے تحت ریئل ٹائم مانیٹرنگ کی سہولت فراہم کرتی ہے۔"
                ) : (
                  "Instantly swap pricing between USD, PKR, or Euros with live automated central bank exchange proxies, securing localized store accuracy."
                )}
              </p>
            </div>

            {/* Feature 6: Advanced Diagnostic Logger */}
            <div className="p-6 md:p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Cpu size={20} className="text-red-400" />
              </div>
              <h3 className="font-extrabold text-xl">{isUr ? "ترجیحی ڈائگناسٹک لاگز" : "Real-time Auditing Logs"}</h3>
              <p className="text-xs md:text-sm leading-relaxed text-white/60">
                {isUr ? (
                  "صوتی ریکارڈ کی ڈیبگنگ اور تجزیے کے لیے ریئل ٹائم کنسول ریکارڈنگ، جو عمل کو مکمل شفاف بناتی ہے۔"
                ) : (
                  "Detailed debug event consoles display speech confidence scores, exact extracted tokens, and processing durations as you speak."
                )}
              </p>
            </div>
          </div>
        </section>


        {/* ================= HOW IT WORKS SECTION ================= */}
        <section className="py-12 border-t border-white/5 flex flex-col gap-12">
          <div className="text-center flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 text-purple-400 text-xs font-bold tracking-widest uppercase">
              <Layers size={14} className="text-purple-400" />
              <span>{isUr ? "طریقہ کار" : "How It Works"}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {isUr ? "چار آسان مراحل میں شاپنگ مکمل کریں" : "Four Steps to Instant Order Fulfillment"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col gap-3.5 p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative hover:border-purple-500/20 transition-all">
              <span className="text-6xl font-black text-purple-500/10 font-mono">01</span>
              <h4 className="font-extrabold text-lg">{isUr ? "لسٹ بولیں یا اسکین کریں" : "Speak or Upload"}</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                {isUr ? "آواز کا اسسٹنٹ مائیک دبائیں اور فہرست بولیں، یا رسید اسکینر کے ذریعے پرانی لسٹ اپ لوڈ کریں۔" : "Tap the glowing microphone and list your items casually, or upload a photo of a printed receipt."}
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-3.5 p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative hover:border-indigo-500/20 transition-all">
              <span className="text-6xl font-black text-indigo-500/10 font-mono">02</span>
              <h4 className="font-extrabold text-lg">{isUr ? "AI تجزیہ اور فزی میچنگ" : "Natural Parser Engine"}</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                {isUr ? "سستم صوتی متن کا گہرائی سے تجزیہ کر کے دکان کی مصنوعات سے اسمارٹ فزی مماثلت کرتا ہے۔" : "Our language model processes the string, normalizes quantities, matches with database inventories, and resolves synonyms."}
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-3.5 p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative hover:border-emerald-500/20 transition-all">
              <span className="text-6xl font-black text-emerald-500/10 font-mono">03</span>
              <h4 className="font-extrabold text-lg">{isUr ? "کارٹ کا خودکار جائزہ" : "Verify Live Extractions"}</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                {isUr ? "دستیاب مصنوعات اور غیر دستیاب مصنوعات کو الگ الگ خانوں میں دکھایا جاتا ہے جہاں ترمیم ممکن ہے۔" : "Review parsed checkout drafts. View matched catalog items and unlisted items separated cleanly, allowing custom quantities."}
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col gap-3.5 p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative hover:border-purple-500/20 transition-all">
              <span className="text-6xl font-black text-purple-500/10 font-mono">04</span>
              <h4 className="font-extrabold text-lg">{isUr ? "تیز ترین چیک آؤٹ" : "Secure Checkout"}</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                {isUr ? "واحد کلک سے ملٹی کرنسی میں انوائس تیار کریں اور محفوظ ادائیگی مکمل کریں۔" : "Confirm details, swap currencies instantly, and generate detailed PDF checkout invoices with live system logging."}
              </p>
            </div>
          </div>
        </section>


        {/* ================= BENEFITS SECTION ================= */}
        <section className="py-12 border-t border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 relative flex justify-center items-center">
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
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col gap-6 text-left">
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
          </div>
        </section>


        {/* ================= FUTURE SCOPE ================= */}
        <section className="py-12 border-t border-white/5 flex flex-col gap-12">
          <div className="text-center flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 text-purple-400 text-xs font-bold tracking-widest uppercase">
              <Lightbulb size={14} className="text-purple-400" />
              <span>{isUr ? "مستقبل کا دائرہ کار" : "Future Horizons"}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {isUr ? "آنے والے شاندار اپ ڈیٹس" : "Expanding the Power of Voice Shopping"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-all duration-300 flex flex-col gap-3">
              <span className="text-3xl">🥗</span>
              <h4 className="font-extrabold text-lg">{isUr ? "غذائی سفارشات" : "Dietary Intelligence"}</h4>
              <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                {isUr ? "آپ کی صوتی فہرست کا جائزہ لے کر آپ کی صحت اور فٹنس کے مطابق بہترین تجاویز فراہم کی جائیں گی۔" : "Intelligent evaluation of voice-parsed groceries to suggest nutritional, organic, or low-allergen alternatives."}
              </p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-all duration-300 flex flex-col gap-3">
              <span className="text-3xl">🍲</span>
              <h4 className="font-extrabold text-lg">{isUr ? "ترکیب سے کارٹ کا اخراج" : "Recipe-to-Cart Parsing"}</h4>
              <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                {isUr ? "صرف کسی پکوان کا نام بولیں (جیسے بریانی) اور اس کے تمام اجزاء خود بخود کارٹ میں آ جائیں گے۔" : "Just name a recipe like 'Chicken Biryani' or 'Pancakes' and watch the system automatically pull all necessary ingredients into your cart."}
              </p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-all duration-300 flex flex-col gap-3">
              <span className="text-3xl">📱</span>
              <h4 className="font-extrabold text-lg">{isUr ? "موبائل ایپس" : "Native Mobile Clients"}</h4>
              <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                {isUr ? "آئی او ایس اور اینڈرائیڈ کے لیے خوبصورت مٹیریل ڈيزائن پر مبنی آفیشل صوتی شاپنگ ایپس۔" : "Native iOS and Android clients with integrated neural modules to capture speech patterns offline with zero packet loss."}
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
