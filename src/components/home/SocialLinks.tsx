"use client";

import { socialLinks } from "@/config/portfolio";
import { useLanguage } from "@/i18n/LanguageProvider";

export function SocialLinks() {
  const { t, tr } = useLanguage();
  return (
    <div className="social-links" aria-label={t.hero.social}>
      {socialLinks.map(({ label, href, icon: Icon }) => (
        <a
          className="social-link"
          href={href}
          key={href}
          aria-label={tr(label)}
          title={tr(label)}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
        >
          <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}
