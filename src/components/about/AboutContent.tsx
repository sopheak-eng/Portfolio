"use client";

import type { CSSProperties } from "react";
import { Code2, Palette, Smartphone } from "lucide-react";
import { SectionHeading } from "@/components/sections/Section";
import { JourneyCards } from "./JourneyCards";
import { skillIcons } from "@/components/skills/skillIcons";
import { toolkitGroups } from "@/config/toolkit";
import { useLanguage } from "@/i18n/LanguageProvider";
import { hexToRgb, rgba } from "@/lib/color";

/** Tile tint (10%), tile border (20%) and card hover border (35%) from one brand colour; white logos get a softer neutral tint. */
function tintVars(color: string) {
  const white = color.toUpperCase() === "#FFFFFF";
  const rgb = hexToRgb(color);
  return {
    "--tile-bg": white ? "rgba(255,255,255,0.06)" : rgba(rgb, 0.1),
    "--tile-border": white ? "rgba(255,255,255,0.1)" : rgba(rgb, 0.2),
    "--hover-border": rgba(rgb, 0.35),
  } as CSSProperties;
}

/** One icon per entry of t.whatIDo.items, in the same order (the text lives in src/i18n). */
const WHAT_I_DO_ICONS = [Code2, Palette, Smartphone];

/* Blocks of the About and Skills sections (formerly the /about page). Static: only the section itself fades in. */

export function AboutToolkit() {
  const { t, tr } = useLanguage();
  return (
    <div className="about-block">
      <SectionHeading title={t.skills.toolkitTitle} />
      <div className="toolkit">
        {toolkitGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <h3 className="toolkit-category card-title">{tr(group.category)}</h3>
            <ul className="toolkit-grid m-0 list-none p-0">
              {group.items.map(({ name, icons, tint }) => (
                <li className="card toolkit-item" key={icons[0].name} style={tintVars(tint ?? icons[0].color)}>
                  <span className="toolkit-icon">
                    {icons.map(({ name: iconName, color }) => {
                      const Icon = skillIcons[iconName];
                      // Two logos share one tile, so each is a little smaller.
                      return <Icon key={iconName} size={icons.length > 1 ? 16 : 20} style={{ color }} aria-hidden />;
                    })}
                  </span>
                  <span>{tr(name)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AboutJourney() {
  const { t } = useLanguage();
  return (
    <div className="about-block">
      <SectionHeading title={t.journey.title} />
      <JourneyCards />
    </div>
  );
}

export function AboutWhatIDo() {
  const { t } = useLanguage();
  return (
    <div className="about-block">
      <SectionHeading title={t.whatIDo.title} />
      <div className="about-do-grid">
        {t.whatIDo.items.map(({ title, text }, index) => {
          const Icon = WHAT_I_DO_ICONS[index];
          return (
          <article className="card about-do-card" key={index}>
            <span className="about-do-icon">
              <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h3 className="card-title">{title}</h3>
            <p>{text}</p>
          </article>
          );
        })}
      </div>
    </div>
  );
}
