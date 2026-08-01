const fs = require("fs");
const path = require("path");

const vaPath = path.join(__dirname, "src", "components", "VoiceAssistant.jsx");
let code = fs.readFileSync(vaPath, "utf8");

// 1. Add speakText helper function near top of VoiceAssistant.jsx
if (!code.includes("const speakText =")) {
  const speakTextCode = `
const speakText = (text, language = "en") => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "ur" ? "ur-PK" : "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("Speech synthesis error:", e);
  }
};
`;
  code = code.replace("export default function VoiceAssistant", speakTextCode + "\nexport default function VoiceAssistant");
}

// 2. Add state for recipeCard and recipeLoading inside component
if (!code.includes("const [recipeCard, setRecipeCard]")) {
  const stateCode = `
  const [recipeCard, setRecipeCard] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
`;
  code = code.replace('const [voiceLoading, setVoiceLoading] = useState(false);', 'const [voiceLoading, setVoiceLoading] = useState(false);' + stateCode);
}

// 3. Add handleRecipeSearch function
if (!code.includes("const handleRecipeSearch =")) {
  const recipeSearchCode = `
  const handleRecipeSearch = async (queryText) => {
    const textToSearch = queryText || customText || transcriptText;
    if (!textToSearch || !textToSearch.trim()) return;

    setRecipeLoading(true);
    addLog(isUr ? \`ریسپی تلاش کی جا رہی ہے: "\${textToSearch}"\` : \`Searching recipe database for: "\${textToSearch}"\`);
    try {
      const res = await api.searchRecipe(textToSearch, lang, currency);
      if (res && res.recipe) {
        const rec = res.recipe;
        setRecipeCard(rec);

        const draftItems = (rec.ingredients || []).map(ing => ({
          productId: ing.productId || ("custom_recipe_" + Math.random().toString(36).substring(2, 9)),
          qty: ing.qty || 1,
          action: "set",
          name: ing.name,
          nameUr: ing.nameUr,
          price: ing.price || 1.99,
          category: ing.category || "Pantry",
          unit: ing.unit || "pack",
          unitUr: ing.unitUr || "پیکٹ",
          matched: !!ing.matched,
          currencyCode: ing.currencyCode || "PKR"
        }));

        setVoiceDraftList(draftItems);

        const title = isUr ? (rec.nameUr || rec.nameEn) : rec.nameEn;
        const availCount = (rec.ingredients || []).filter(i => i.matched).length;
        const ttsMessage = isUr
          ? \`میں نے \${title} کی ترکیب تلاش کر لی ہے۔ اس کے لیے \${rec.ingredients.length} اجزاء درکار ہیں اور \${availCount} اسٹور میں دستیاب ہیں۔\`
          : \`Found recipe for \${title}! It requires \${rec.ingredients.length} ingredients with \${availCount} available in store.\`;

        addLog(ttsMessage);
        speakText(ttsMessage, lang);
        onNotify(isUr ? \`\${title} کی ترکیب مل گئی!\` : \`Found recipe for \${title}!\`, "success");
      }
    } catch (err) {
      console.error("Recipe search error:", err);
      onNotify(isUr ? "ریسپی تلاش میں ناکامی" : "Failed to search recipe.", "error");
    } finally {
      setRecipeLoading(false);
    }
  };
`;
  code = code.replace('const handleManualSubmit =', recipeSearchCode + '\n  const handleManualSubmit =');
}

fs.writeFileSync(vaPath, code, "utf8");
console.log("Successfully added handleRecipeSearch and speakText to VoiceAssistant.jsx!");
