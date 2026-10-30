"use client";

import { motion, useReducedMotion } from "motion/react";
import { Code2, GraduationCap } from "lucide-react";
import { experiences } from "@/config/journey";
import { useLanguage } from "@/i18n/LanguageProvider";

/** Two equal cards, side by side from md (oldest left); on mobile the current role comes first. Each fades in once. */
export function JourneyCards() {
  const reduced = useReducedMotion() ?? false;
  const { t, tr } = useLanguage();

  return (
    <ol className="m-0 grid list-none items-stretch gap-6 p-0 md:grid-cols-2 md:gap-8">
      {experiences.map(({ id, period, role, org, description, highlights, current }, index) => {
        const Icon = current ? Code2 : GraduationCap;
        return (
          <motion.li
            key={id}
            data-reveal
            className={`flex flex-col rounded-2xl border border-white/[0.08] bg-surface p-8 transition-colors duration-200 hover:border-white/15 md:p-10 ${current ? "max-md:order-first" : ""}`}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm text-white/60">{tr(period)}</span>
                {current && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-[#ff4d7e]">
                    <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                    {t.journey.now}
                  </span>
                )}
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-white/70" aria-hidden="true">
                <Icon size={20} strokeWidth={1.6} />
              </span>
            </div>

            <h3 className="m-0 mt-4 font-heading text-2xl font-bold text-white">{tr(role)}</h3>
            <p className="m-0 mt-1 text-white/50">{tr(org)}</p>
            <p className="m-0 mt-5 leading-7 text-[#c9cbd1]">{tr(description)}</p>

            <ul className="m-0 mt-5 list-none space-y-2 p-0 text-sm text-white/70">
              {highlights.map((item, i) => (
                <li key={i} className="flex gap-3">
                  {/* 4px dot, centred on the first line whatever its height (Khmer lines are taller). */}
                  <span
                    className={`size-1 shrink-0 rounded-full ${current ? "bg-accent" : "bg-white/40"}`}
                    style={{ marginTop: "calc(0.5lh - 2px)" }}
                    aria-hidden="true"
                  />
                  {tr(item)}
                </li>
              ))}
            </ul>
          </motion.li>
        );
      })}
    </ol>
  );
}
