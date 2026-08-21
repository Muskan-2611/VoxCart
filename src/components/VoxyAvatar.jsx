import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

import voxyIdle from "../assets/images/vox_hy.png";
import voxyHappy from "../assets/images/vox_happy.png";
import voxyThinking from "../assets/images/vox_think.png";

export { voxyIdle, voxyHappy, voxyThinking };

const IMAGES = { idle: voxyIdle, happy: voxyHappy, thinking: voxyThinking };

/**
 * Voxy — floating 3D avatar launcher for the VoxCart AI assistant.
 * Purely presentational: it renders a state and reports clicks.
 *
 * props:
 *   state      "idle" | "happy" | "thinking"
 *   onClick    () => void
 *   showTeaser boolean
 *   lang       "en" | "ur"
 *   hasUnread  boolean
 */
export default function VoxyAvatar({ state = "idle", onClick, showTeaser = false, lang = "en", hasUnread = false }) {
  const reduce = useReducedMotion();
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const isUr = lang === "ur";

  // Preload every state so switching never flashes.
  useEffect(() => {
    Object.values(IMAGES).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const float =
    reduce || state === "happy"
      ? {}
      : {
          y: [0, -10, 0],
          rotate: [-2, 2, -2],
          transition: {
            duration: state === "thinking" ? 6 : 4.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        };

  const label = isUr ? "ووکسی سے بات کریں" : "Open Voxy, the VoxCart assistant";
  const teaserText = isUr ? "ہائے، میں ووکسی ہوں 👋" : "Hi, I'm Voxy 👋";
  const showBubble = showTeaser && state === "idle" && !teaserDismissed;

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex items-end gap-2" dir={isUr ? "rtl" : "ltr"}>
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="relative mb-6 max-w-[13rem] rounded-2xl rounded-br-sm border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {teaserText}
            <button
              type="button"
              onClick={() => setTeaserDismissed(true)}
              aria-label={isUr ? "بند کریں" : "Dismiss"}
              className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-slate-700 text-white shadow"
            >
              <X className="size-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* ground glow */}
        <div
          className={`pointer-events-none absolute bottom-1 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-full bg-cyan-400/30 blur-2xl transition-opacity ${
            state === "idle" ? "opacity-70" : "opacity-100"
          }`}
        />

        {/* happy ring pulse */}
        <AnimatePresence>
          {state === "happy" && (
            <motion.span
              key="ring"
              initial={{ scale: 0.7, opacity: 0.6 }}
              animate={{ scale: 1.4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 rounded-full border border-cyan-400/60"
            />
          )}
        </AnimatePresence>

        {/* thinking dots */}
        <AnimatePresence>
          {state === "thinking" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -top-3 left-1/2 flex -translate-x-1/2 gap-1"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={reduce ? {} : { opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                  className="size-1.5 rounded-full bg-cyan-400"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={onClick}
          aria-label={label}
          animate={float}
          whileHover={reduce ? {} : { scale: 1.06 }}
          whileTap={reduce ? {} : { scale: 0.94 }}
          className="relative block cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
        >
          <motion.img
            key={state}
            src={IMAGES[state] || IMAGES.idle}
            alt="Voxy, the VoxCart shopping assistant"
            width={1024}
            height={1280}
            initial={{ opacity: 0, scale: state === "happy" ? 0.9 : 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            className="h-auto w-[76px] object-contain drop-shadow-2xl sm:w-[104px]"
            draggable={false}
          />

          {hasUnread && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-[9px] font-bold text-white z-10 animate-pulse shadow-md">
              1
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
