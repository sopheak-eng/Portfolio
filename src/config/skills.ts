import type { Translatable } from "@/i18n/LanguageProvider";

/** Icon keys resolved to components in src/components/skills/skillIcons.ts. */
export type SkillIconName =
  | "html5"
  | "css"
  | "javascript"
  | "typescript"
  | "react"
  | "nextjs"
  | "tailwind"
  | "nodejs"
  | "supabase"
  | "python"
  | "git"
  | "github"
  | "figma"
  | "restApi"
  | "aiTools"
  | "webDesign"
  | "uiux"
  | "ai"
  | "team";

export type SkillIcon = {
  name: SkillIconName;
  /** Brand colour for logos; silver for the generic professional-skill icons. */
  color: string;
};

export type Skill = {
  /** Tech names stay as plain strings; everything else is { en, km }. */
  name: Translatable;
  /** 0–100. */
  level: number;
  icons: SkillIcon[];
};

export type SkillGroup = {
  title: Translatable;
  skills: Skill[];
};

export const SILVER = "#C0C7D1";

export const skillGroups: SkillGroup[] = [
  {
    title: { en: "Coding Skills", km: "ជំនាញសរសេរកូដ" },
    skills: [
      {
        name: "HTML & CSS",
        level: 90,
        icons: [
          { name: "html5", color: "#E34F26" },
          { name: "css", color: "#1572B6" },
        ],
      },
      {
        name: "JavaScript / TypeScript",
        level: 75,
        icons: [
          { name: "javascript", color: "#F7DF1E" },
          { name: "typescript", color: "#3178C6" },
        ],
      },
      {
        name: "React / Next.js",
        level: 80,
        icons: [
          { name: "react", color: "#61DAFB" },
          { name: "nextjs", color: "#FFFFFF" },
        ],
      },
      { name: "Tailwind CSS", level: 85, icons: [{ name: "tailwind", color: "#06B6D4" }] },
    ],
  },
  {
    title: { en: "Professional Skills", km: "ជំនាញវិជ្ជាជីវៈ" },
    skills: [
      { name: { en: "Web Design", km: "ការរចនាគេហទំព័រ" }, level: 90, icons: [{ name: "webDesign", color: SILVER }] },
      { name: { en: "UI/UX Design", km: "ការរចនា UI/UX" }, level: 80, icons: [{ name: "uiux", color: SILVER }] },
      { name: { en: "AI-Assisted Development", km: "ការអភិវឌ្ឍដោយមានជំនួយពី AI" }, level: 90, icons: [{ name: "ai", color: SILVER }] },
      { name: { en: "Team Collaboration", km: "ការសហការជាក្រុម" }, level: 85, icons: [{ name: "team", color: SILVER }] },
    ],
  },
];
