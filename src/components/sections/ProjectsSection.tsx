"use client";

import { ArrowUpRight } from "lucide-react";
import { socialLinks } from "@/config/portfolio";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Section, SectionHeading } from "./Section";

const github = socialLinks.find((link) => link.label === "GitHub");

export function ProjectsSection({ id }: { id: string }) {
  const { t } = useLanguage();
  return (
    <Section id={id} labelledBy="projects-title">
      <SectionHeading id="projects-title" title={t.projects.title} />
      {/* Placeholder until real projects (screenshot, title, one line, tech) are added. */}
      <article className="card simple-card">
        <h3 className="card-title">{t.projects.placeholderTitle}</h3>
        <p>{t.projects.placeholderText}</p>
        {github && (
          <a className="text-link" href={github.href} target="_blank" rel="noreferrer">
            {t.projects.github} <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        )}
      </article>
    </Section>
  );
}
