"use client";

import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import GB from "country-flag-icons/react/3x2/GB";
import KH from "country-flag-icons/react/3x2/KH";
import type { FlagComponent } from "country-flag-icons/react/3x2";
import { useLanguage, type Lang } from "@/i18n/LanguageProvider";

/** SVG flags (flag emoji don't render on Windows). Each option is named in its own language, so it reads the same in both. */
const OPTIONS: ReadonlyArray<{ lang: Lang; name: string; Flag: FlagComponent }> = [
  { lang: "en", name: "English", Flag: GB },
  { lang: "km", name: "ភាសាខ្មែរ", Flag: KH },
];

/**
 * Flag pill: 🇬🇧 | 🇰🇭. The pink highlight slides between the options like the nav pill.
 * `id` keeps the desktop and mobile copies from sharing one animated highlight.
 */
export function LanguageSwitcher({ id, className = "" }: { id: string; className?: string }) {
  const { lang, setLang, t } = useLanguage();
  const reduced = useReducedMotion() ?? false;

  return (
    <LayoutGroup id={id}>
      <div role="group" aria-label={t.nav.language} className={`flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 ${className}`}>
        {OPTIONS.map(({ lang: option, name, Flag }) => {
          const active = option === lang;
          return (
            <button
              key={option}
              type="button"
              lang={option}
              aria-label={name}
              aria-pressed={active}
              title={name}
              onClick={() => setLang(option)}
              className="group relative flex size-9 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              {active && (
                <motion.span
                  layoutId="lang-pill"
                  className="absolute inset-0 rounded-full bg-accent"
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
                  aria-hidden="true"
                />
              )}
              <Flag
                aria-hidden="true"
                className={`relative z-10 h-4 w-6 overflow-hidden rounded-[3px] ring-1 ring-black/20 transition duration-200 ${
                  active ? "opacity-100" : "opacity-60 grayscale-[30%] group-hover:opacity-100"
                }`}
              />
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
