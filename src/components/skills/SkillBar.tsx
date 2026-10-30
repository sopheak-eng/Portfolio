"use client";

import { motion } from "motion/react";
import type { Skill } from "@/config/skills";
import { format, useLanguage } from "@/i18n/LanguageProvider";
import { skillIcons } from "./skillIcons";

interface SkillBarProps {
  skill: Skill;
  /** Fill once the cards are in view. */
  active: boolean;
  /** Seconds before this row fills (row stagger). */
  delay: number;
  reduced: boolean;
}

export function SkillBar({ skill, active, delay, reduced }: SkillBarProps) {
  const { t, tr } = useLanguage();
  const { level, icons } = skill;
  const name = tr(skill.name);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="flex min-w-0 items-center gap-4">
          <span className="flex shrink-0 gap-2">
            {icons.map(({ name: iconName, color }) => {
              const Icon = skillIcons[iconName];
              return (
                <span key={iconName} className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5">
                  <Icon size={20} style={{ color }} aria-hidden />
                </span>
              );
            })}
          </span>
          <span className="min-w-0 font-medium leading-snug text-white">{name}</span>
        </span>
        {/* The final value, shown straight away — only the bar animates. */}
        <span className="shrink-0 font-mono text-sm text-silver tabular-nums" aria-hidden="true">
          {level}%
        </span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-white/[0.06]"
        role="progressbar"
        aria-label={format(t.skills.level, { name })}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={level}
        aria-valuetext={`${level}%`}
      >
        <motion.div
          className="h-full rounded-full bg-silver"
          initial={reduced ? false : { width: 0 }}
          animate={{ width: active || reduced ? `${level}%` : 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay }}
        />
      </div>
    </div>
  );
}
