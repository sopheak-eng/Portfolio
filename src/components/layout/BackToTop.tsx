"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

/** Bottom-right button that appears once the hero is scrolled past. */
export function BackToTop() {
  const reduced = useReducedMotion() ?? false;
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > window.innerHeight * 0.8));

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          className="fixed right-4 bottom-4 z-40 grid size-10 cursor-pointer place-items-center rounded-full border border-line-strong bg-surface text-silver shadow-elevation transition-colors duration-200 hover:border-accent hover:text-accent md:right-8 md:bottom-8"
          aria-label={t.backToTop}
          title={t.backToTop}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
        >
          <ArrowUp size={18} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
