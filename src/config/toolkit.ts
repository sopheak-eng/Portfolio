import type { Translatable } from "@/i18n/LanguageProvider";
import { SILVER, type SkillIcon } from "./skills";

export type ToolkitItem = {
  /** Tech names stay as plain strings; generic labels are { en, km }. */
  name: Translatable;
  /** Brand logos in their official colours (icon keys resolve in src/components/skills/skillIcons.ts). */
  icons: SkillIcon[];
  /** Tile tint and hover border. Defaults to the first icon's colour. */
  tint?: string;
};

export type ToolkitGroup = {
  category: Translatable;
  items: ToolkitItem[];
};

const WHITE = "#FFFFFF";

/** "Skills & tech stack" grid in the Skills section. */
export const toolkitGroups: ToolkitGroup[] = [
  {
    category: { en: "Frontend", km: "ផ្នែកខាងមុខ" },
    items: [
      { name: "React", icons: [{ name: "react", color: "#61DAFB" }] },
      { name: "Next.js", icons: [{ name: "nextjs", color: WHITE }] },
      { name: "TypeScript", icons: [{ name: "typescript", color: "#3178C6" }] },
      {
        name: "HTML / CSS",
        icons: [
          { name: "html5", color: "#E34F26" },
          { name: "css", color: "#1572B6" },
        ],
        // Two brands in one tile: a neutral tint so neither colour wins.
        tint: WHITE,
      },
    ],
  },
  {
    category: { en: "Backend", km: "ផ្នែកខាងក្រោយ" },
    items: [
      { name: "Node.js", icons: [{ name: "nodejs", color: "#5FA04E" }] },
      { name: "REST APIs", icons: [{ name: "restApi", color: SILVER }] },
      { name: "Supabase", icons: [{ name: "supabase", color: "#3FCF8E" }] },
      { name: "Python", icons: [{ name: "python", color: "#3776AB" }] },
    ],
  },
  {
    category: { en: "Tools", km: "ឧបករណ៍" },
    items: [
      { name: "Git", icons: [{ name: "git", color: "#F05032" }] },
      { name: "GitHub", icons: [{ name: "github", color: WHITE }] },
      { name: "Figma", icons: [{ name: "figma", color: "#F24E1E" }] },
      { name: { en: "AI Tools", km: "ឧបករណ៍ AI" }, icons: [{ name: "aiTools", color: SILVER }] },
    ],
  },
];
