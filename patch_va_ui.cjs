const fs = require("fs");
const path = require("path");

const vaPath = path.join(__dirname, "src", "components", "VoiceAssistant.jsx");
let code = fs.readFileSync(vaPath, "utf8");

// Add Recipe search button to the form
const formTarget = `<button
                    type="submit"
                    className="bg-purple-500 hover:bg-purple-400 text-slate-950 p-3 rounded-xl active:scale-95 transition cursor-pointer font-bold shadow-md shadow-purple-500/10"
                  >
                    <Send size={18} />
                  </button>`;

const formReplacement = `<button
                    type="submit"
                    className="bg-purple-500 hover:bg-purple-400 text-slate-950 p-3 rounded-xl active:scale-95 transition cursor-pointer font-bold shadow-md shadow-purple-500/10"
                    title={isUr ? "صوتی ڈرافٹ بنائیں" : "Parse Voice/Text"}
                  >
                    <Send size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecipeSearch(customText)}
                    disabled={recipeLoading}
                    className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold px-3.5 py-3 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition active:scale-95 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {recipeLoading ? (
                      <Loader2 size={16} className="animate-spin text-slate-950" />
                    ) : (
                      <span>🍳 {isUr ? "ترکیب تلاش" : "AI Recipe"}</span>
                    )}
                  </button>`;

if (!code.includes("AI Recipe</span>")) {
  code = code.replace(formTarget, formReplacement);
}

// Render Recipe Card right below the form or inside voice module
const recipeCardUI = `
                {/* AI INTERACTIVE RECIPE & COOKING GUIDE CARD */}
                {recipeCard && (
                  <div className="w-full border border-purple-500/30 bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 flex flex-col gap-4 text-left shadow-2xl animate-fade-in mt-4">
                    <div className="flex items-start justify-between border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="p-1 px-2.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <span>🍳</span>
                            <span>{recipeCard.category || "AI Recipe"}</span>
                          </span>
                          <span className="text-white/50 text-[10px]">🔥 {recipeCard.calories || "450 kcal"}</span>
                        </div>
                        <h3 className="font-display font-bold text-xl text-white">
                          {isUr ? (recipeCard.nameUr || recipeCard.nameEn) : recipeCard.nameEn}
                        </h3>
                        <p className="text-white/60 text-xs mt-0.5">
                          {isUr ? (recipeCard.descriptionUr || recipeCard.descriptionEn) : recipeCard.descriptionEn}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRecipeCard(null)}
                        className="text-white/40 hover:text-white text-xs p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center bg-white/5 p-2.5 rounded-xl border border-white/10 text-xs">
                      <div>
                        <div className="text-white/40 text-[9px] uppercase font-bold">{isUr ? "تیاری" : "Prep"}</div>
                        <div className="text-purple-300 font-bold">{recipeCard.prepTime || "15m"}</div>
                      </div>
                      <div>
                        <div className="text-white/40 text-[9px] uppercase font-bold">{isUr ? "پکانا" : "Cook"}</div>
                        <div className="text-indigo-300 font-bold">{recipeCard.cookTime || "30m"}</div>
                      </div>
                      <div>
                        <div className="text-white/40 text-[9px] uppercase font-bold">{isUr ? "افراد" : "Servings"}</div>
                        <div className="text-amber-300 font-bold">{recipeCard.servings || "4"}</div>
                      </div>
                      <div>
                        <div className="text-white/40 text-[9px] uppercase font-bold">{isUr ? "مشکل" : "Difficulty"}</div>
                        <div className="text-green-300 font-bold">{recipeCard.difficulty || "Easy"}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const steps = (isUr ? recipeCard.instructionsUr : recipeCard.instructionsEn) || [];
                          const speechText = \`\${isUr ? recipeCard.nameUr : recipeCard.nameEn}. \${steps.join(". ")}\`;
                          speakText(speechText, lang);
                        }}
                        className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                      >
                        <span>🔊 {isUr ? "ہدایت سنیں" : "Read Steps Out Loud"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddVoiceItemsToCart}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-md"
                      >
                        <span>🛒 {isUr ? "اجزاء کارٹ میں ڈالیں" : "Add Recipe Ingredients"}</span>
                      </button>
                    </div>

                    {((isUr ? recipeCard.instructionsUr : recipeCard.instructionsEn) || []).length > 0 && (
                      <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>👨‍🍳 {isUr ? "پکانے کا طریقہ (Step-by-Step Instructions):" : "Step-by-Step Instructions:"}</span>
                        </h4>
                        <ol className="flex flex-col gap-2 pl-1">
                          {((isUr ? recipeCard.instructionsUr : recipeCard.instructionsEn) || []).map((step, sIdx) => (
                            <li key={sIdx} className="text-xs text-white/80 leading-relaxed flex items-start gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                              <span className="font-bold text-purple-400 shrink-0">{sIdx + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
`;

if (!code.includes("AI INTERACTIVE RECIPE & COOKING GUIDE CARD")) {
  code = code.replace("</form>\n              </div>", "</form>\n" + recipeCardUI + "\n              </div>");
}

fs.writeFileSync(vaPath, code, "utf8");
console.log("Successfully updated VoiceAssistant.jsx UI with Recipe Card and button!");
