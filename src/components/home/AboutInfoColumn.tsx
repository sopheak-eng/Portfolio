"use client";

import { ArrowUpRight, BrainCircuit, PanelsTopLeft, PenTool, Smartphone, Users } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

/** One icon per entry of t.about.focus, in the same order. */
const FOCUS_ICONS = [PanelsTopLeft, Smartphone, BrainCircuit, PenTool, Users];

/** Right side of the About card. Rhythm on the 8px grid: 40px between blocks, 16px inside them.
 *  The focus list goes to two content-sized columns only where both fit on one line each (xl). */
export function AboutInfoColumn() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-start">
      <p className="m-0 max-w-xl text-base leading-8 text-[#c9cbd1] md:text-lg" data-aos="fade-up" data-aos-delay="300">
        {t.about.lead}
      </p>

      <h4 className="home-about-focus-title mt-10">{t.about.focusTitle}</h4>
      <ul className="m-0 mt-4 grid w-full list-none gap-y-4 p-0 xl:grid-cols-[repeat(2,max-content)] xl:gap-x-8">
        {t.about.focus.map((label, index) => {
          const Icon = FOCUS_ICONS[index];
          return (
          <li key={index} className="flex items-center gap-3 text-[#c9cbd1]" data-aos="fade-up" data-aos-delay={350 + index * 50}>
            <span className="home-about-focus-icon size-8">
              <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span>{label}</span>
          </li>
          );
        })}
      </ul>

      <a className="primary-cta mt-10" href="#projects" data-aos="fade-up" data-aos-delay="600">
        {t.about.explore} <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </div>
  );
}
