import React, { useState, useEffect } from "react";
import { TRANSLATIONS } from "../utils/localizer";
import { api } from "../utils/api";
import { 
  MessageSquare, 
  Send, 
  Star, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  Mail, 
  HelpCircle, 
  MessageCircle, 
  ShieldAlert, 
  Sparkles,
  RefreshCw,
  Trash2
} from "lucide-react";

export default function FeedbackPage({ lang, user, onNotify }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS["en"];
  const isUr = lang === "ur";

  const [activeTab, setActiveTab] = useState("submit"); // "submit" | "history"

  // Form State
  const [feedbackType, setFeedbackType] = useState("feedback"); // "feedback" | "complaint" | "suggestion"
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [submitting, setSubmitting] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Sync user info if props change
  useEffect(() => {
    if (user) {
      if (!name) setName(user.name || "");
      if (!email) setEmail(user.email || "");
    }
  }, [user]);

  // Fetch feedback history when switching to history tab
  useEffect(() => {
    if (activeTab === "history") {
      fetchUserHistory();
    }
  }, [activeTab, user]);

  const fetchUserHistory = async () => {
    setLoadingHistory(true);
    try {
      const items = await api.getFeedback(user?.id, email || user?.email);
      setHistoryItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load feedback history:", err);
      onNotify?.(isUr ? "ہسٹری لوڈ کرنے میں ناکامی" : "Failed to load feedback history", "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      onNotify?.(isUr ? "براہ کرم عنوان اور پیغام درج کریں۔" : "Please provide both subject and message.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: user?.id || "guest",
        userName: name.trim() || user?.name || "Anonymous User",
        userEmail: email.trim() || user?.email || "guest@voxcart.com",
        type: feedbackType,
        subject: subject.trim(),
        message: message.trim(),
        rating
      };

      const res = await api.submitFeedback(payload);
      onNotify?.(
        isUr 
          ? "آپ کا پیغام کامیابی سے موصول ہو گیا۔ شکریہ!" 
          : "Your feedback/complaint has been submitted successfully!", 
        "success"
      );

      // Reset form
      setSubject("");
      setMessage("");
      setRating(5);
      
      // Auto switch to history
      setActiveTab("history");
    } catch (err) {
      onNotify?.(err.message || (isUr ? "سبمٹ کرنے میں ناکامی" : "Failed to submit feedback"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 font-sans select-none">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-purple-900/40 border border-purple-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full text-purple-300 text-xs font-bold uppercase tracking-widest w-fit">
            <MessageSquare size={14} className="text-purple-400" />
            <span>{isUr ? "کسٹمر کیئر اور فیڈ بیک" : "Customer Support & Feedback"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {isUr ? "فیڈ بیک اور شکایات کا پورٹل" : "Feedback & Complaint Center"}
          </h1>
          <p className="text-white/60 text-xs md:text-sm max-w-xl leading-relaxed">
            {isUr 
              ? "ہمارے لیے آپ کی رائے اور تجربہ انتہائی اہم ہے۔ اپنی کسی بھی شکایت، فیڈ بیک یا تجویز کو ہم تک پہنچائیں اور فوری ٹیم کا ردعمل حاصل کریں۔"
              : "We value your experience! Share complaints, feature requests, or general feedback. Our support team reviews all submissions and responds promptly."}
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 shrink-0 relative z-10 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("submit")}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "submit"
                ? "bg-purple-500 text-slate-950 shadow-lg font-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Send size={14} />
            <span>{isUr ? "نیا پیغام بھیجیں" : "Submit New"}</span>
          </button>
          
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "history"
                ? "bg-purple-500 text-slate-950 shadow-lg font-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Clock size={14} />
            <span>{isUr ? "میری گزشتہ شکایات/فیڈ بیک" : "My Submissions"}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "submit" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Submission Form Card (Lg: col-span-8) */}
          <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                <span>{isUr ? "نیا پیغام درج کریں" : "Submit Your Message"}</span>
              </h2>
              <span className="text-xs text-white/40 font-mono">* Required fields</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Category Type selector tabs */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                  {isUr ? "پیغام کی قسم منتخب کریں *" : "Category Type *"}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFeedbackType("feedback")}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer ${
                      feedbackType === "feedback"
                        ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/10"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <MessageCircle size={16} className="text-purple-400" />
                    <span>{isUr ? "عام فیڈ بیک" : "Feedback"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackType("complaint")}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer ${
                      feedbackType === "complaint"
                        ? "bg-red-500/20 border-red-500 text-red-300 shadow-lg shadow-red-500/10"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <ShieldAlert size={16} className="text-red-400" />
                    <span>{isUr ? "شکایت" : "Complaint"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackType("suggestion")}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer ${
                      feedbackType === "suggestion"
                        ? "bg-blue-500/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/10"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <HelpCircle size={16} className="text-blue-400" />
                    <span>{isUr ? "تجویز" : "Suggestion"}</span>
                  </button>
                </div>
              </div>

              {/* Star Rating selector */}
              <div className="flex flex-col gap-2 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center justify-between">
                  <span>{isUr ? "تجربے کی درجہ بندی (اسٹار ریٹنگ) *" : "Overall Rating *"}</span>
                  <span className="text-amber-400 font-bold">{rating} / 5 Stars</span>
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl transition hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        size={28}
                        className={star <= rating ? "fill-amber-400 text-amber-400" : "text-white/20"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                    {isUr ? "آپ کا نام" : "Your Name"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Ali Ahmed"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/10 rounded-xl pl-10 pr-4 py-3 text-xs outline-none text-white transition font-medium"
                    />
                    <User size={16} className="absolute left-3.5 top-3.5 text-white/40" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                    {isUr ? "ای میل ایڈریس *" : "Email Address *"}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="e.g. user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/10 rounded-xl pl-10 pr-4 py-3 text-xs outline-none text-white transition font-medium"
                    />
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-white/40" />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                  {isUr ? "عنوان *" : "Subject *" }
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    feedbackType === "complaint"
                      ? "e.g. Delay in delivery or missing item in order"
                      : feedbackType === "suggestion"
                      ? "e.g. Add more local organic brands"
                      : "e.g. Great voice assistant experience!"
                  }
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/10 rounded-xl px-4 py-3 text-xs outline-none text-white transition font-medium"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                  {isUr ? "تفصیلی پیغام *" : "Detailed Message *"}
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder={
                    feedbackType === "complaint"
                      ? (isUr 
                          ? "براہ کرم پروڈکٹ کا SKU نمبر درج کریں اور پھر اپنی شکایت کی تفصیل لکھیں۔" 
                          : "Please enter the product SKU number and then describe your complaint.")
                      : (isUr 
                          ? "براہ کرم اپنی شکایت، فیڈ بیک یا تجویز کی تفصیل یہاں لکھیں..." 
                          : "Please write all relevant details here...")
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/10 rounded-xl p-4 text-xs outline-none text-white transition font-medium leading-relaxed resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-black py-4 px-8 rounded-2xl text-sm transition shadow-lg shadow-purple-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2 select-none"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>{isUr ? "ارسال ہو رہا ہے..." : "Submitting..."}</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>
                      {feedbackType === "complaint"
                        ? (isUr ? "شکایت درج کریں" : "Submit Complaint")
                        : feedbackType === "suggestion"
                        ? (isUr ? "تجویز بھیجیں" : "Submit Suggestion")
                        : (isUr ? "فیڈ بیک بھیجیں" : "Submit Feedback")}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Side Panel (Lg: col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>{isUr ? "ہمارا وعدہ" : "Our Service Guarantee"}</span>
              </h3>
              <ul className="flex flex-col gap-3 text-xs text-white/60 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{isUr ? "تمام موصولہ شکایات کا جائزہ 24 گھنٹے کے اندر لیا جاتا ہے۔" : "All complaints are investigated by staff within 24 hours."}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{isUr ? "ایڈمن کا جواب براہ راست پورٹل ہسٹری میں دکھائی دے گا۔" : "Admin responses will appear under 'My Submissions'."}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{isUr ? "آپ کی ذاتی معلومات مکمل محفوظ ہیں۔" : "Your contact details are strictly kept private."}</span>
                </li>
              </ul>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-gradient-to-br from-purple-900/30 via-slate-900 to-slate-950 border border-purple-500/20 rounded-3xl p-6 flex flex-col gap-3">
              <span className="text-2xl">📞</span>
              <h4 className="font-bold text-white text-sm">{isUr ? "براہ راست رابطہ" : "Need Instant Help?"}</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                {isUr ? "کسی بھی ہنگامی مسئلے کے لیے ووکسی AI سے لائیو چیٹ کریں یا ڈیش بورڈ استعمال کریں۔" : "For live instant assistance with active orders, ask Voxy AI in the bottom right corner!"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* History View Tab */
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Clock size={18} className="text-purple-400" />
              <span>{isUr ? "آپ کے بھیجے گئے پیغامات" : "Your Submitted Feedback & Complaints"}</span>
            </h2>
            <button
              onClick={fetchUserHistory}
              className="text-xs text-purple-300 hover:text-white flex items-center gap-1.5 cursor-pointer bg-white/5 px-3 py-1.5 rounded-xl border border-white/10"
            >
              <RefreshCw size={12} className={loadingHistory ? "animate-spin" : ""} />
              <span>{isUr ? "تازہ کریں" : "Refresh"}</span>
            </button>
          </div>

          {loadingHistory ? (
            <div className="p-12 text-center text-white/50 text-xs flex flex-col items-center gap-2">
              <RefreshCw size={24} className="animate-spin text-purple-400" />
              <span>{isUr ? "ہسٹری لوڈ ہو رہی ہے..." : "Loading submissions history..."}</span>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="p-12 text-center text-white/40 text-xs bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center gap-3">
              <MessageSquare size={36} className="text-white/20" />
              <p className="font-medium">{isUr ? "کوئی شکایت یا فیڈ بیک نہیں ملا۔" : "No submitted feedback or complaints found."}</p>
              <button
                onClick={() => setActiveTab("submit")}
                className="mt-2 bg-purple-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-purple-400 transition cursor-pointer"
              >
                {isUr ? "نیا پیغام دیں" : "Submit Your First Feedback"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 shadow-xl hover:border-purple-500/30 transition-all"
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
                        <span>{item.status === "Replied" ? (isUr ? "جواب موصول ہوا" : "Replied") : (isUr ? "زیرِ التوا" : "Pending Review")}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-white/40 font-mono">
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Subject & Rating */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-extrabold text-base text-white">{item.subject}</h3>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            className={s <= item.rating ? "fill-amber-400 text-amber-400" : "text-white/20"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/5 my-1">
                      {item.message}
                    </p>
                  </div>

                  {/* Admin Reply Box if Replied */}
                  {item.adminResponse && (
                    <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex flex-col gap-2 mt-1">
                      <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={14} />
                          <span>{isUr ? "ووکس کارٹ ٹیم کا باضابطہ جواب:" : "Official Response from VoxCart Staff:"}</span>
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {item.repliedAt ? new Date(item.repliedAt).toLocaleString() : ""}
                        </span>
                      </div>
                      <p className="text-xs text-white/90 leading-relaxed font-medium pl-5 border-l-2 border-emerald-500">
                        {item.adminResponse}
                      </p>
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
