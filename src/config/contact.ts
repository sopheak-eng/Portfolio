/** Icon keys resolve to brand logos in src/components/contact/contactIcons.ts. */
export type ContactIconName = "telegram" | "gmail" | "linkedin" | "github";

/** A decorative contact icon on the tree (not a link). */
export type ContactItem = {
  label: string;
  icon: ContactIconName;
  /** Official brand colour. */
  color: string;
};

/**
 * PLACEHOLDER — replace with your real address before publishing.
 * Where the contact form sends messages.
 */
export const CONTACT_EMAIL = "you@gmail.com";

/** Branch tips of the contact tree, top to bottom (and the mobile icon row, left to right). Decorative only. */
export const contactItems: ContactItem[] = [
  { label: "Telegram", icon: "telegram", color: "#26A5E4" },
  { label: "Gmail", icon: "gmail", color: "#EA4335" },
  { label: "LinkedIn", icon: "linkedin", color: "#0A66C2" },
  { label: "GitHub", icon: "github", color: "#FFFFFF" },
];
