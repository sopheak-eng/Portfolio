import type { LucideIcon } from "lucide-react";
import type { Dictionary } from "@/i18n/en";
import type { Translatable } from "@/i18n/LanguageProvider";

export type NavItem = {
  /** Label key in the dictionaries (t.nav[key]). */
  key: keyof Pick<Dictionary["nav"], "home" | "about" | "skills" | "projects" | "contact">;
  href: string;
};

export type SocialLink = {
  label: Translatable;
  href: string;
  icon: LucideIcon;
};
