import {
  GitFork,
  Mail,
  Send,
  Users,
} from "lucide-react";
import type { NavItem, SocialLink } from "@/types/portfolio";
import { CONTACT_EMAIL } from "./contact";

// Single-page site: every item is a section of the home page.
export const navigation: NavItem[] = [
  { key: "home", href: "/#home" },
  { key: "about", href: "/#about" },
  { key: "skills", href: "/#skills" },
  { key: "projects", href: "/#projects" },
  { key: "contact", href: "/#contact" },
];

/** Where the contact form sends messages: the one address set in src/config/contact.ts. */
export const contactEmail = CONTACT_EMAIL;

export const socialLinks: SocialLink[] = [
  // Replace these service-level URLs with the owner's verified profile URLs.
  { label: "GitHub", href: "https://github.com", icon: GitFork },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Users },
  { label: "Telegram", href: "https://t.me", icon: Send },
  { label: { en: "Email", km: "អ៊ីមែល" }, href: `mailto:${contactEmail}`, icon: Mail },
];
