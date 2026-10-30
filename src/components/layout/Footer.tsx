"use client";

import { useLanguage } from "@/i18n/LanguageProvider";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <p>
        © {new Date().getFullYear()} ENG SOPHEAK. {t.footer.builtWith}
      </p>
    </footer>
  );
}
