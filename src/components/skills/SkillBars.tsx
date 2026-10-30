"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { skillGroups } from "@/config/skills";
import { useLanguage } from "@/i18n/LanguageProvider";
import { SectionHeading } from "@/components/sections/Section";
import { SkillBar } from "./SkillBar";

const ROW_STAGGER = 0.08;
const CARD_STAGGER = 0.1;
/** Bars start just after the section has faded in. */
const BARS_START = 0.3;

/** Heading + the two skill cards. Bars fill once, when the cards scroll into view. */
export function SkillBars() {
  const reduced = useReducedMotion() ?? false;
  const barsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(barsRef, { once: true, amount: 0.3 });
  const { t, tr } = useLanguage();
  const { before, highlight, after } = t.skills.title;

  return (
    <div>
      <SectionHeading id="skills-title">
        {before}
        <span className="text-accent">{highlight}</span>
        {after}
      </SectionHeading>

      {/* Cards are min-w-0 so a column can shrink to the screen; long skill names wrap instead of widening the card. */}
      <div ref={barsRef} className="grid gap-8 md:grid-cols-2">
        {skillGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="min-w-0">
            <h3 className="card-title mb-4">{tr(group.title)}</h3>
            <div className="card p-6 transition-transform duration-200 ease-out hover:-translate-y-0.5 md:p-8">
              <div className="space-y-6">
                {group.skills.map((skill, rowIndex) => (
                  <SkillBar
                    key={rowIndex}
                    skill={skill}
                    active={inView}
                    delay={BARS_START + groupIndex * CARD_STAGGER + rowIndex * ROW_STAGGER}
                    reduced={reduced}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
