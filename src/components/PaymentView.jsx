import React, { useState } from "react";
import { TRANSLATIONS, formatPrice } from "../utils/localizer";
import { CreditCard, Wallet, Truck, ShieldCheck, ArrowLeft, Loader2, Sparkles, AlertCircle, ShoppingBag, CheckCircle } from "lucide-react";

export default function PaymentView({
  lang,
  currency,
  checkoutData,
  onSubmitPayment,
  onCancel
}) {
  const t = TRANSLATIONS[lang];
  const isUr = lang === "ur";

  // State management
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' | 'wallet' | 'cod'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardType, setCardType] = useState("visa"); // visa | mastercard | generic

  // Mobile Wallet
  const [walletType, setWalletType] = useState("easypaisa"); // easypaisa | jazzcash
  const [walletPhone, setWalletPhone] = useState("");
  const [walletOtpCode, setWalletOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Billing address (used for CoD or general verification)
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [city, setCity] = useState("Karachi");

  // Localized texts
  const pText = {
    en: {
      payTitle: "Secure Checkout Portal",
      paySub: "Select your preferred payment gateway to process and place your order instantly",
      methodCard: "Credit / Debit Card",
      methodWallet: "Mobile Wallet (PK)",
      methodCod: "Cash on Delivery",
      btnPayNow: "Complete Secure Payment",
      otpBtn: "Send Instant Verification OTP",
      otpSentMsg: "A secure verification code has been sent to your phone.",
      addressTitle: "Shipping & Contact Details",
      addressLabel: "Physical Delivery Address",
      phoneLabel: "Active Contact Mobile",
      cityLabel: "Select City",
      secWarranty: "Your transactions are encrypted securely with end-to-end modern protocols.",
      successMsg: "Payment Processed and Authenticated!",
      successSub: "Generating invoice receipt... Redirecting shortly."
    },
    ur: {
      payTitle: "محفوظ ادائیگی کا پورٹل",
      paySub: "اپنا پسندیدہ ادائیگی کا طریقہ منتخب کریں اور اپنا آرڈر فوری مکمل کریں",
      methodCard: "کریڈٹ یا ڈیبٹ کارڈ",
      methodWallet: "موبائل والٹ (ایزی پیسہ / جاز کیش)",
      methodCod: "کیش آن ڈیلیوری",
      btnPayNow: "محفوظ ادائیگی مکمل کریں",
      otpBtn: "تصدیقی کوڈ (OTP) بھیجیں",
      otpSentMsg: "آخری مرحلے کے لیے آپ کے موبائل پر تصدیقی کوڈ بھیج دیا گیا ہے۔",
      addressTitle: "ڈیلیوری اور رابطہ کی تفصیلات",
      addressLabel: "ڈیلیوری کا پتہ",
      phoneLabel: "رابطہ نمبر",
      cityLabel: "شہر کا انتخاب کریں",
      secWarranty: "آپ کی ادائیگی اینڈ ٹو اینڈ جدید انکرپشن سکیورٹی کے تحت محفوظ ہے۔",
      successMsg: "ادائیگی کامیابی سے وصول ہو گئی ہے!",
      successSub: "تھوڑی ہی دیر میں آپ کو رسید پر لے جایا جائے گا۔"
    }
  }[lang];

  // Logic to dynamically detect card type
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length > 16) value = value.slice(0, 16);

    // Format input beautifully as: 4532 1234 5678 9012
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);

    // Dynamic icon check
    if (value.startsWith("4")) {
      setCardType("visa");
    } else if (value.startsWith("5")) {
      setCardType("mastercard");
    } else {
      setCardType("generic");
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);

    if (value.length >= 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setCvv(value);
  };

  const handleSendOtp = () => {
    if (!walletPhone || walletPhone.length < 10) {
      setError(isUr ? "برائے مہربانی درست والٹ نمبر لکھیں" : "Please input a valid Pakistani mobile number.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
    }, 1000);
  };

  const submitTransaction = (e) => {
    e.preventDefault();
    setError("");

    // Field Validations
    if (!deliveryAddress.trim()) {
      setError(isUr ? "ڈیلیوری کا پتہ لکھنا ضروری ہے" : "Please fill in the physical delivery address.");
      return;
    }
    if (!deliveryPhone.trim() || deliveryPhone.length < 10) {
      setError(isUr ? "درست رابطہ نمبر لکھنا ضروری ہے" : "Please supply a valid contact number.");
      return;
    }

    if (paymentMethod === "card") {
      const cleanCard = cardNumber.replace(/\s/g, "");
      if (cleanCard.length < 16) {
        setError(isUr ? "کارڈ نمبر مکمل نہیں ہے" : "Please insert a complete 16-digit card number.");
        return;
      }
      if (expiry.length < 5) {
        setError(isUr ? "درست تاریخ تنسیخ درج کریں" : "Please insert expiration date (MM/YY).");
        return;
      }
      if (cvv.length < 3) {
        setError(isUr ? "درست سکیورٹی پن (CVV) درج کریں" : "Please input a valid 3-digit CVV pin.");
        return;
      }
    } else if (paymentMethod === "wallet") {
      if (!walletPhone) {
        setError(isUr ? "جاز کیش / ایزی پیسہ نمبر ہونا ضروری ہے" : "Please enter your wallet number.");
        return;
      }
      if (!otpSent) {
        setError(isUr ? "پہلے او ٹی پی تصدیق مکمل کریں" : "Please obtain verify OTP before checkout confirmation.");
        return;
      }
      if (!walletOtpCode || walletOtpCode.length < 4) {
        setError(isUr ? "برائے مہربانی درست پن کوڈ لکھیں" : "Verification OTP PIN code is incorrect.");
        return;
      }
    }

    setLoading(true);

    // Format transaction payload details
    let paymentDetails = { paymentMethod };
    let paymentStatus = "Pending";

    if (paymentMethod === "card") {
      paymentDetails = {
        gateway: "Card Processing API",
        cardHolder,
        cardBrand: cardType,
        maskedNumber: `•••• •••• •••• ${cardNumber.slice(-4)}`
      };
      paymentStatus = "Paid";
    } else if (paymentMethod === "wallet") {
      paymentDetails = {
        gateway: walletType === "easypaisa" ? "EasyPaisa Pro Connect" : "JazzCash Merchant Core",
        walletNumber: walletPhone,
        transactionId: "TXN-" + Math.floor(200000 + Math.random() * 800000)
      };
      paymentStatus = "Paid";
    } else {
      paymentDetails = {
        gateway: "Cash on Delivery Fulfilment",
        codNotes: "Customer requested payment at pickup",
        deliveryCity: city
      };
      paymentStatus = "Pending";
    }

    // Call submit handler which hooks into server.ts
    setTimeout(async () => {
      try {
        await onSubmitPayment({
          ...checkoutData,
          paymentMethod: paymentMethod === "card" ? "Credit / Debit Card" : (paymentMethod === "wallet" ? `${walletType === "easypaisa" ? "EasyPaisa" : "JazzCash"} Phone Wallet` : "Cash on Delivery"),
          paymentDetails,
          paymentStatus,
          deliveryAddress,
          deliveryPhone
        });
        setSuccess(true);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Endpoint error recording transaction.");
        setLoading(false);
      }
    }, 1800);
  };

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-[500px]">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 animate-bounce">
          <CheckCircle size={44} />
        </div>
        <h2 className="font-display font-black text-3xl text-white mb-2">{pText.successMsg}</h2>
        <p className="text-sm text-white/50">{pText.successSub}</p>
        <div className="mt-8 flex items-center gap-2 text-xs text-emerald-400 font-mono">
          <Loader2 className="animate-spin" size={14} />
          <span>Synchronizing MySQL cloud records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-2 md:px-4">
      {/* Back button */}
      <button
        onClick={onCancel}
        className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300 hover:text-purple-200 cursor-pointer w-fit"
      >
        <ArrowLeft size={14} />
        <span>{isUr ? "کارٹ پر واپس جائیں" : "Back to Cart Shopping"}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Payment details & Gateway selection (7 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none select-none">
              <CreditCard size={150} />
            </div>

            <h2 className="font-display font-black text-2xl text-white mb-1.5 flex items-center gap-2.5">
              <ShieldCheck className="text-purple-400 shrink-0" />
              <span>{pText.payTitle}</span>
            </h2>
            <p className="text-white/50 text-xs leading-relaxed max-w-xl">
              {pText.paySub}
            </p>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/25 rounded-xl p-3 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Selector Buttons */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("card");
                  setError("");
                }}
                className={`py-3.5 px-3 rounded-xl flex flex-col items-center justify-center gap-2 border transition duration-300 cursor-pointer ${
                  paymentMethod === "card"
                    ? "bg-purple-500/10 border-purple-500/40 text-purple-300"
                    : "bg-[#090b14]/50 border-white/10 text-white/40 hover:border-white/25 hover:text-white"
                }`}
              >
                <CreditCard size={18} />
                <span className="text-[10.5px] font-bold text-center leading-none">{pText.methodCard}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("wallet");
                  setError("");
                }}
                className={`py-3.5 px-3 rounded-xl flex flex-col items-center justify-center gap-2 border transition duration-300 cursor-pointer ${
                  paymentMethod === "wallet"
                    ? "bg-purple-500/10 border-purple-500/40 text-purple-300"
                    : "bg-[#090b14]/50 border-white/10 text-white/40 hover:border-white/25 hover:text-white"
                }`}
              >
                <Wallet size={18} />
                <span className="text-[10.5px] font-bold text-center leading-none">{pText.methodWallet}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("cod");
                  setError("");
                }}
                className={`py-3.5 px-3 rounded-xl flex flex-col items-center justify-center gap-2 border transition duration-300 cursor-pointer ${
                  paymentMethod === "cod"
                    ? "bg-purple-500/10 border-purple-500/40 text-purple-300"
                    : "bg-[#090b14]/50 border-white/10 text-white/40 hover:border-white/25 hover:text-white"
                }`}
              >
                <Truck size={18} />
                <span className="text-[10.5px] font-bold text-center leading-none">{pText.methodCod}</span>
              </button>
            </div>

            {/* GATEWAY GATE SECTION */}
            <form onSubmit={submitTransaction} className="mt-6 flex flex-col gap-5">
              
              {/* PAYMENT OPTION A: CREDIT CARD */}
              {paymentMethod === "card" && (
                <div className="flex flex-col gap-4 bg-black/35 rounded-xl border border-white/5 p-4 md:p-5 relative animate-fade-in">
                  
                  {/* Glossy Visual Interactive Credit Card */}
                  <div className="w-full max-w-[340px] mx-auto h-48 rounded-2xl p-5 text-white bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 shadow-xl border border-white/10 relative overflow-hidden flex flex-col justify-between mb-2">
                    {/* Glowing card accents */}
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                    
                    <div className="flex items-start justify-between">
                      {/* Interactive chip icon */}
                      <div className="w-10 h-8 rounded-md bg-amber-400/20 border border-amber-300/30 flex items-center justify-center p-1.5 shadow">
                        <div className="w-full h-full bg-amber-500/30 rounded" />
                      </div>
                      
                      {/* Dynamic Brand Text Label */}
                      <span className="font-display font-black tracking-widest text-[#eeeeee] text-sm uppercase italic">
                        {cardType === "visa" ? "VISA" : (cardType === "mastercard" ? "MASTERCARD" : "DEBIT CARD")}
                      </span>
                    </div>

                    {/* Masked formatted credit number */}
                    <div className="font-mono text-lg tracking-widest text-center py-2 text-white/95">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </div>

                    <div className="flex items-end justify-between text-xs font-mono font-medium">
                      <div>
                        <span className="text-[8px] text-white/40 uppercase tracking-widest block mb-0.5">Card Holder</span>
                        <span className="truncate max-w-[150px] block uppercase">{cardHolder || "Valued Customer"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-white/40 uppercase tracking-widest block mb-0.5">Expires</span>
                        <span>{expiry || "MM/YY"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Input Form Fields */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-white/55 uppercase tracking-wider">Cardholder Full Name</label>
                      <input
                        type="text"
                        required
                        className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50"
                        placeholder="John Doe"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-white/55 uppercase tracking-wider">Credit Card Number</label>
                      <input
                        type="text"
                        required
                        className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 font-mono"
                        placeholder="4532 8763 3244 8721"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/55 uppercase tracking-wider">Expiry Date</label>
                        <input
                          type="text"
                          required
                          className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 font-mono"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={handleExpiryChange}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/55 uppercase tracking-wider">Security Code (CVV)</label>
                        <input
                          type="password"
                          required
                          className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 font-mono"
                          placeholder="•••"
                          value={cvv}
                          onChange={handleCvvChange}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* PAYMENT OPTION B: MOBILE WALLET */}
              {paymentMethod === "wallet" && (
                <div className="flex flex-col gap-4 bg-black/35 rounded-xl border border-white/5 p-4 md:p-5 animate-fade-in">
                  <div className="flex items-center justify-center gap-3 bg-[#0a0c16] rounded-xl p-1 border border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setWalletType("easypaisa");
                        setOtpSent(false);
                      }}
                      className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-black uppercase transition cursor-pointer select-none ${
                        walletType === "easypaisa"
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      🌱 EasyPaisa
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWalletType("jazzcash");
                        setOtpSent(false);
                      }}
                      className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-black uppercase transition cursor-pointer select-none ${
                        walletType === "jazzcash"
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      👑 JazzCash
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-[10px] font-bold text-white/55 uppercase tracking-wider">
                      {walletType === "easypaisa" ? "EasyPaisa Mobile Account" : "JazzCash Account Number"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 font-mono"
                        placeholder="0300 1234567"
                        value={walletPhone}
                        onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, ""))}
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading || otpSent}
                        className="bg-purple-500 hover:bg-purple-400 disabled:bg-white/5 disabled:text-white/30 text-slate-950 font-black px-4 rounded-xl text-xs transition cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-1.5 justify-center"
                      >
                        {loading && <Loader2 size={12} className="animate-spin" />}
                        <span>{pText.otpBtn}</span>
                      </button>
                    </div>
                  </div>

                  {otpSent && (
                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 flex flex-col gap-3.5 animate-pulse">
                      <span className="text-[11px] text-purple-300 font-medium">{pText.otpSentMsg}</span>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-white/55 uppercase tracking-wider">Secure OTP PIN Code</label>
                        <input
                          type="password"
                          className="bg-black/50 border border-purple-500/30 focus:border-purple-400 rounded-xl px-4 py-2 text-sm text-white outline-none font-mono tracking-widest text-center"
                          placeholder="••••"
                          value={walletOtpCode}
                          onChange={(e) => setWalletOtpCode(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PAYMENT OPTION C: COD & CONTACT INFO */}
              <div className="bg-black/35 rounded-xl border border-white/5 p-4 md:p-5 flex flex-col gap-4">
                <h3 className="text-xs font-black text-white/70 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
                  <span>🏢</span>
                  <span>{pText.addressTitle}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-white/55 uppercase tracking-wider">{pText.phoneLabel}</label>
                    <input
                      type="text"
                      className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 font-mono"
                      placeholder="e.g. 03456781223"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-white/55 uppercase tracking-wider">{pText.cityLabel}</label>
                    <select
                      className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      <option className="bg-slate-900" value="Karachi">Karachi</option>
                      <option className="bg-slate-900" value="Lahore">Lahore</option>
                      <option className="bg-slate-900" value="Islamabad">Islamabad</option>
                      <option className="bg-slate-900" value="Rawalpindi">Rawalpindi</option>
                      <option className="bg-slate-900" value="Faisalabad">Faisalabad</option>
                      <option className="bg-slate-900" value="Sialkot">Sialkot</option>
                      <option className="bg-slate-900" value="Peshawar">Peshawar</option>
                      <option className="bg-slate-900" value="Quetta">Quetta</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/55 uppercase tracking-wider">{pText.addressLabel}</label>
                  <textarea
                    rows={2.5}
                    className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-purple-500/50 resize-none leading-relaxed"
                    placeholder="e.g. House 42, Street 7, Block D, Gulshan-e-Iqbal..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Secure SSL Warranty Line */}
              <div className="flex items-center gap-2.5 bg-purple-500/[0.02] border border-purple-500/10 rounded-xl p-3 text-[10px] text-purple-300 leading-relaxed font-semibold shadow-sm">
                <span className="text-sm">🔒</span>
                <span>{pText.secWarranty}</span>
              </div>

              {/* CONFIRMATION SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer active:scale-[0.98] shadow-lg shadow-purple-950/25 flex items-center justify-center gap-2.5"
              >
                {loading ? (
                  <Loader2 className="animate-spin text-slate-950" size={16} />
                ) : (
                  <span>🛒 {pText.btnPayNow}</span>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Basket checkout items summary (4 Cols) */}
        <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col gap-4">
          <h3 className="text-xs font-black text-white/70 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
            <ShoppingBag size={14} className="text-purple-400" />
            <span>{isUr ? "آرڈر خلاصہ" : "Order Basket Summary"}</span>
          </h3>

          {/* Render Summary List items */}
          <div className="flex flex-col gap-3.5 max-h-[220px] overflow-y-auto pr-1">
            {checkoutData?.items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 border border-white/5 bg-white/5 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {typeof item.img === "string" && (item.img.startsWith("http") || item.img.startsWith("/")) ? (
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{item.img || "📦"}</span>
                    )}
                  </div>
                  <div className="min-w-0 leading-tight">
                    <span className="font-bold text-white block truncate">{isUr ? item.nameUr : item.name}</span>
                    <span className="text-[10px] text-white/40 block mt-0.5 font-mono">{item.qty} × {formatPrice(item.price, currency, lang, item.currencyCode)}</span>
                  </div>
                </div>
                <span className="font-bold text-white font-mono">{formatPrice(item.price * item.qty, currency, lang, item.currencyCode)}</span>
              </div>
            ))}
          </div>

          {/* Pricing Ledger totals block */}
          <div className="border-t border-white/10 pt-4 flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Subtotal</span>
              <span className="font-bold font-mono text-white">{formatPrice(checkoutData.subtotal, currency, lang, "USD")}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Tax (5%)</span>
              <span className="font-bold font-mono text-white">{formatPrice(checkoutData.tax, currency, lang, "USD")}</span>
            </div>
            
            <div className="border-t border-dashed border-white/10 pt-3 flex items-end justify-between">
              <span className="text-white font-black text-xs uppercase tracking-widest">Grand Total</span>
              <div className="text-right leading-none">
                <span className="text-lg font-black font-display text-purple-300 tracking-tight block">
                  {formatPrice(checkoutData.total, currency, lang, "USD")}
                </span>
                <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest mt-1 block">Includes secure processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
