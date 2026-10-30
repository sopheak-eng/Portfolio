"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { HeroPortrait } from "@/components/home/HeroPortrait";
import { SocialLinks } from "@/components/home/SocialLinks";
import { TypewriterName } from "@/components/home/TypewriterName";
import { useLanguage } from "@/i18n/LanguageProvider";

export function HeroSection({ id }: { id: string }) {
  const reduced = useReducedMotion() ?? false;
  const { t } = useLanguage();
  const [role1, role2, role3] = t.hero.roles;

  return (
    <section className="hero" id={id}>
      <div className="hero-shell">
        <div className="hero-grid grid w-full items-center gap-12 lg:grid-cols-2">
          {/* The copy fades in once as a single block. */}
          <motion.div
            className="hero-copy mx-auto max-w-2xl lg:mx-0"
            data-reveal
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="availability">
              <span aria-hidden="true" /> {t.hero.available}
            </div>
            <h1>
              <span>{t.hero.greeting}</span>
              <TypewriterName text="ENG SOPHEAK" />
            </h1>
            <p className="roles">
              {role1} <i aria-hidden="true" /> {role2} <i aria-hidden="true" /> {role3}
            </p>
            <p className="summary">
              {t.hero.summary}
            </p>
            <div className="hero-actions">
              <a className="primary-cta" href="#projects">{t.hero.explore} <ArrowRight size={18} aria-hidden="true" /></a>
            </div>
            <SocialLinks />
          </motion.div>

          <HeroPortrait />
        </div>
      </div>
    </section>
  );
}
