"use client";

import { SectionHeading } from "@/components/sections/Section";
import { useLanguage } from "@/i18n/LanguageProvider";
import { AboutInfoColumn } from "./AboutInfoColumn";
import { AboutPhoto } from "./AboutPhoto";

/** Top of the About section: heading + one card with the photo (left) and the intro + focus list (right). */
export function AboutMe() {
  const { t } = useLanguage();
  return (
    <div>
      {/* AOS fade-up, staggered: heading → card → photo → text → focus items → button. */}
      <SectionHeading id="home-about-title" title={t.about.title} aos />
      {/* Solid surface so it separates from the page; the two-tone border is its ::before (globals.css). */}
      <div className="card home-about-card relative grid items-center gap-12 rounded-2xl border-0 bg-surface p-8 md:gap-16 md:p-14 lg:grid-cols-[2fr_3fr]"
        data-aos="fade-up"
        data-aos-duration="1200"
        data-aos-delay="100"
      >
        <AboutPhoto />
        <AboutInfoColumn />
      </div>
    </div>
  );
}
