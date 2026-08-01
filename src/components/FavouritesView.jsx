import React from "react";
import { TRANSLATIONS, formatPrice } from "../utils/localizer";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

export default function FavouritesView({
  lang,
  currency,
  products,
  favourites,
  onAddFromCatalog,
  onToggleFavourite
}) {
  const t = TRANSLATIONS[lang];

  // Resolve matching products
  const resolvedFavs = products.filter(p => favourites.includes(p.id));

  return (
    <div className="py-4 flex flex-col gap-6">
      <div className="border-b border-white/10 pb-4">
        <h2 className="font-display font-bold text-2xl text-white mb-1 flex items-center gap-2">
          <Heart className="text-red-500 fill-current animate-pulse" />
          <span>{t.wishlist}</span>
        </h2>
        <p className="text-sm text-white/50 leading-relaxed">
          Products you saved for quick voice checkout or addition.
        </p>
      </div>

      {resolvedFavs.length === 0 ? (
        <div className="glass-panel border border-white/10 rounded-3xl p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2 shadow-xl">
          <Heart size={44} className="text-purple-400/20 mb-2 animate-bounce" />
          <h4 className="font-bold text-white text-lg">Your Wishlist is Empty</h4>
          <p className="text-xs text-gray-400">Tag products in the catalog to access them quickly here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {resolvedFavs.map((p) => {
            const isImgUrl = typeof p.img === "string" && (p.img.startsWith("http://") || p.img.startsWith("https://") || p.img.startsWith("/"));
            return (
              <div
                key={p.id}
                className="group relative glass-panel border border-white/10 hover:border-purple-400/40 rounded-3xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl overflow-hidden"
              >
                {/* Remove heart */}
                <button
                  onClick={() => onToggleFavourite(p.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition z-10 cursor-pointer active:scale-90"
                  title="Remove Favourite"
                >
                  <Trash2 size={13} />
                </button>

                <div className="flex flex-col items-center text-center mt-2 mb-4">
                  <div className="w-24 h-24 shrink-0 bg-slate-900 border border-white/10 rounded-2xl mb-3 flex items-center justify-center overflow-hidden group-hover:scale-105 transition duration-300">
                    {isImgUrl ? (
                      <img 
                        src={p.img} 
                        alt={p.name} 
                        className="w-full h-full object-cover rounded-xl" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-4xl">{p.img || "🥛"}</span>
                    )}
                  </div>
                  <span className="text-[9px] font-black text-purple-300 uppercase tracking-widest bg-purple-500/15 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                    {p.category}
                  </span>
                </div>

                <div className="text-center w-full mt-auto">
                  <h4 className="font-display font-bold text-sm text-white line-clamp-1 h-5 mb-1 group-hover:text-purple-300 transition-colors">
                    {lang === "ur" ? p.nameUr : p.name}
                  </h4>
                  {p.price === 0 || p.status === "Inactive" || p.status === "Unavailable" || p.status?.toLowerCase() === "inactive" || p.status?.toLowerCase() === "unavailable" || p.stockQuantity <= 0 ? (
                    <div className="flex items-center justify-center bg-red-500/10 p-2.5 rounded-xl border border-red-500/20 w-full mt-2">
                      <span className="font-bold text-xs text-red-400">
                        {lang === "ur" ? "غیر دستیاب" : "Unavailable"}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="text-[11px] text-gray-400 font-medium mb-3">
                         per {lang === "ur" ? p.unitUr : p.unit}
                      </div>

                      <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-white/10">
                        <div className="flex flex-col pl-1 items-start justify-center">
                          {p.salePrice && p.salePrice > 0 ? (
                            <>
                              <span className="font-bold text-[10px] text-gray-500 line-through leading-none">
                                {formatPrice(p.price, currency, lang, p.currencyCode)}
                              </span>
                              <span className="font-black text-xs text-emerald-400">
                                {formatPrice(p.salePrice, currency, lang, p.currencyCode)}
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-sm text-purple-300">
                              {formatPrice(p.price, currency, lang, p.currencyCode)}
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => onAddFromCatalog(p.id)}
                          className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold transition cursor-pointer active:scale-95 shadow-md"
                          title="Add to active shopping cart"
                        >
                          <ShoppingCart size={13} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
